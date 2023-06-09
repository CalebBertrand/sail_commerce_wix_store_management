import { indexOfBackwards } from "../../lib/utils";
import { ProductOptionTypes, type ProductOption } from "../product";

enum ExpressionTypes {
    Number = 'Number',
    String = 'String',
    Boolean = 'Boolean'
}
enum OperationTypes {
    Unary = 'Unary',
    Turnary = 'Turnary'
}
enum UnaryOperations {
    Addition = '+',
    Subtraction = '-',
    Multiplication = '*',
    Division = '/',
    EqualityComparison = '=',
    GreaterThanComparison = '>',
    LesserThanComparision = '<'
}
type EqualityOperations = UnaryOperations.EqualityComparison | UnaryOperations.GreaterThanComparison | UnaryOperations.LesserThanComparision;

type ExpressionBase = {
    type: ExpressionTypes;
}
type Expression = ExpressionBase & ({
    isComposite: true;
    operationType: OperationTypes.Turnary;
    conditionalExpression: Expression;
    trueExpression: Expression;
    falseExpression: Expression;
} | {
    isComposite: true;
    operationType: OperationTypes.Unary;
    unaryOperation: UnaryOperations;
    leftHand: Expression;
    rightHand: Expression;
} | {
    isComposite: false;
    value: string;
} | {
    isComposite: false;
    optionName: string;
});

const unaryOperations = [
    UnaryOperations.Addition,
    UnaryOperations.Subtraction,
    UnaryOperations.Multiplication,
    UnaryOperations.Division,
    UnaryOperations.EqualityComparison,
    UnaryOperations.GreaterThanComparison,
    UnaryOperations.LesserThanComparision
];
const equalityOperations = [
    UnaryOperations.EqualityComparison,
    UnaryOperations.GreaterThanComparison,
    UnaryOperations.LesserThanComparision
];

/** 
 * Validates that the string is a formula that conforms to these rules:
 * 1. only contains the operations +, -, *, /, =, and IF()
 * 2. only contains the values of numbers, strings, and booleans
 * 3. all IF() functions return only one type of value
 * 4. other than the above, the OPTIONS["some string"] expression is also allowed, and it's type is determined by the options object passed in
 * 
 * @returns the formula expression tree or a string containing the error message.
 */
export function parsePriceFormula(formula: string, options: Array<ProductOption>): Expression | string {
    // If there are more than one thousand characters, we may be targeted for a DOS attack
    if (formula.length > 1_000) return 'Formula too long.';
    const expression = parseExpressionString(formula, options);
    if (typeof expression === "string") return expression;
    if (expression.type !== ExpressionTypes.Number) return 'The formula must return a number!';
    return expression;
}

/**
 * Recursive helper function. 
 * @returns the expression or a string containing an error message.
 * */
export function parseExpressionString(formula: string, options: Array<ProductOption>): Expression | string {
    formula = formula.trim();

    // NOTE: The order of the below checks matters! They correspond to the order of operations

    // Empty string
    if (!formula.length) return 'Empty!';

    let firstExpression: Expression;
    let leftHandEndIndex = -1;

    // First expression is an IF() statement
    if (formula.slice(0, 3) === 'IF(') {
        const endIndex = formula.length - 1;

        // TODO: This is a hacky way to check for a closing parenthesis. We should use a stack instead.
        if (formula[endIndex] !== ')') return `Could not find a closing ) for the IF(. Unexpected ${formula.substring(endIndex + 1)}`;

        let firstCommaIndex = 0;
        // while loop to make sure we only get commas in this IF() function, not nested ones
        do {
            const pastIndex = firstCommaIndex;
            firstCommaIndex = formula.indexOf(',', firstCommaIndex + 1);

            console.log(firstCommaIndex, formula);

            // if we are making no progress, there is a missing comma
            if (firstCommaIndex === pastIndex || firstCommaIndex < 0) return 'Missing parameter for IF() function.';
        } while (isCommaInNestedIf(formula, firstCommaIndex));

        let secondCommaIndex = firstCommaIndex;
        // while loop to make sure we only get commas in this IF() function, not nested ones
        do {
            const pastIndex = secondCommaIndex;
            secondCommaIndex = formula.indexOf(',', secondCommaIndex + 1);

            // if we are making no progress, there is a missing comma
            if (secondCommaIndex === pastIndex || secondCommaIndex < 0) return 'Missing parameter for IF() function.';
        } while (isCommaInNestedIf(formula, secondCommaIndex));

        const expressions = [
            parseExpressionString(formula.substring(3, firstCommaIndex), options),
            parseExpressionString(formula.substring(firstCommaIndex + 1, secondCommaIndex), options),
            parseExpressionString(formula.substring(secondCommaIndex + 1, endIndex), options)
        ];

        // If there are errors in the sub expressions, throw the first one
        const firstError = expressions.find(expr => typeof expr === "string");
        if (firstError) return firstError;

        const [conditionalExpression, trueExpression, falseExpression] = expressions as Array<Expression>;
        if (conditionalExpression.type !== ExpressionTypes.Boolean) return 'The first parameter to a IF() function must be a boolean';
        if (trueExpression.type !== falseExpression.type) return 'The last two parameters of an IF() function must be the same type (number, string or boolean).';

        return {
            isComposite: true,
            type: trueExpression.type,
            operationType: OperationTypes.Turnary,
            conditionalExpression: conditionalExpression,
            trueExpression: trueExpression,
            falseExpression: falseExpression
        };
    }

    // First expression is a string
    if (formula[0] === '"') {
        leftHandEndIndex = formula.indexOf('"', 1);
        if (leftHandEndIndex < 0) return 'Missing double quotes to close string.';
        firstExpression = {
            type: ExpressionTypes.String,
            isComposite: false,
            value: formula.substring(1, leftHandEndIndex)
        };

        leftHandEndIndex += 1;

        // There is nothing else, this is just a literal string
        if (formula.trimEnd().length - 1 < leftHandEndIndex) return firstExpression;
        return parseUnaryOperationString(firstExpression, formula.substring(leftHandEndIndex), options);
    }

    // First expression is an option value
    if (formula.substring(0, 9) === 'OPTIONS["') {
        const closingBracket = formula.indexOf('"]', 9);
        if (closingBracket < 0) return 'Missing closing quotes and bracket for option.';

        const optionName = formula.substring(9, closingBracket);
        const option = options.find(o => o.name === optionName);
        if (!option) return `No option with the name "${optionName}" found.`;

        switch (option.type) {
            case ProductOptionTypes.Number:
                firstExpression = {
                    type: ExpressionTypes.Number,
                    isComposite: false,
                    optionName: option.name
                };
                break;
            case ProductOptionTypes.Select:
                firstExpression = {
                    type: ExpressionTypes.String,
                    isComposite: false,
                    optionName: option.name
                };
                break;
        }

        leftHandEndIndex = closingBracket + 2;

        // There is nothing else, this is just a literal
        if (formula.trimEnd().length - 1 < leftHandEndIndex) return firstExpression;
        return parseUnaryOperationString(firstExpression, formula.substring(leftHandEndIndex), options);
    }

    // First expression is a number
    if (/[0-9]/.test(formula[0])) {
        let decimalPoint = false;
        let i = 1;
        while (/[0-9]/.test(formula[i]) || (formula[i] === '.' && !decimalPoint)) {
            if (formula[i] === '.') decimalPoint = true;
            i++;
        }

        leftHandEndIndex = i;
        firstExpression = {
            type: ExpressionTypes.Number,
            isComposite: false,
            value: formula.substring(0, leftHandEndIndex)
        };

        // There is nothing else, this is just a literal number
        if (formula.trimEnd().length - 1 < leftHandEndIndex) return firstExpression;
        return parseUnaryOperationString(firstExpression, formula.substring(leftHandEndIndex), options);
    }

    return `Unexpected character ${formula[0]}`;
}

/** 
 * Will return the final expression of a lefthand expression and the righthand expression, parsed. 
 * Only use this on strings that you are sure must be a unary expression (ie have already determined that the expression is not a literal).
 */
function parseUnaryOperationString(firstExpression: Expression, remainingFormula: string, options: Array<ProductOption>): Expression | string {
    const operation = remainingFormula.trimStart()[0];
    if (!isUnaryOperation(operation)) return `Unexpected ${remainingFormula}`;

    const secondExpression = parseExpressionString(remainingFormula.trimStart().substring(1), options);
    if (typeof secondExpression === "string") return secondExpression;
    if (secondExpression.type !== firstExpression.type) return `The ${operation} operation requires two values of the same type.`;
    if (
        (secondExpression.type === ExpressionTypes.String || secondExpression.type === ExpressionTypes.Boolean)
        && operation !== UnaryOperations.EqualityComparison
    ) return `The ${operation} operation can only be used on numbers.`;

    return {
        isComposite: true,
        type: isEqualityOperation(operation) ? ExpressionTypes.Boolean : firstExpression.type,
        operationType: OperationTypes.Unary,
        unaryOperation: operation as UnaryOperations,
        leftHand: firstExpression,
        rightHand: secondExpression
    }
}

function isUnaryOperation(operation: string): operation is UnaryOperations {
    return (unaryOperations as Array<string>).includes(operation);
}

function isEqualityOperation(operation: UnaryOperations): operation is EqualityOperations {
    return equalityOperations.includes(operation);
}

function isCommaInNestedIf(formula: string, index: number): boolean {
    return indexOfBackwards(formula, '(', index) !== 2 && formula.indexOf(')', index) !== formula.length - 1;
}
