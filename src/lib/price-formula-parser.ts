import type { ProductOption } from "./product";

export enum ExpressionType {
    Number,
    String,
    Boolean
}

/** 
 * Validates that the string is a formula that conforms to these rules:
 * 1. only contains the operations +, -, *, /, =, and IF()
 * 2. only contains the values of numbers, strings, and booleans
 * 3. all IF() functions return only one type of value
 * 4. other than the above, the OPTIONS["some string"] expression is also allowed, and it's type is determined by the options object passed in
 */
export function isValidExpression(formula: string, options: Array<ProductOption>): ExpressionType | { error: string } {
    formula = formula.trim();

    // If there are more than one thousand characters, we may be targeted for a DOS attack
    if (formula.length > 1_000) return { error: 'Formula too long.' };

    // NOTE: The order of the below checks matters! They correspond to the order of operations

    // Empty string
    if (!formula.length) return { error: 'Empty!' };

    // IF statement
    if (formula.slice(0, 4) === 'IF("') {
        const endIndex = formula.lastIndexOf('")');

        if (endIndex < 0) return { error: 'Could not find a closing ") for the IF(".' };
        if (endIndex !== formula.length - 3) return { error: `Unexpected ${formula.substring(endIndex + 2)}.` };

        let firstCommaIndex = 0;
        // while loop to make sure we only get commas in this IF() function, not nested ones
        do {
            const pastIndex = firstCommaIndex;
            firstCommaIndex = formula.indexOf(',', firstCommaIndex + 1);

            // if we are making no progress, there is a missing comma
            if (firstCommaIndex === pastIndex) return { error: 'Missing parameter for IF() function.' };
        } while (formula.indexOf('")', firstCommaIndex) !== endIndex);

        let secondCommaIndex = firstCommaIndex;
        // while loop to make sure we only get commas in this IF() function, not nested ones
        do {
            const pastIndex = secondCommaIndex;
            secondCommaIndex = formula.indexOf(',', secondCommaIndex + 1);

            // if we are making no progress, there is a missing comma
            if (secondCommaIndex === pastIndex) return { error: 'Missing parameter for IF() function.' };
        } while (formula.indexOf('")', secondCommaIndex) !== endIndex);

        const expressions = [
            isValidExpression(formula.substring(4, firstCommaIndex), options),
            isValidExpression(formula.substring(firstCommaIndex + 1, secondCommaIndex), options),
            isValidExpression(formula.substring(secondCommaIndex + 1, endIndex), options)
        ];

        // If there are errors in the sub expressions, throw the first one
        const firstError = expressions.find(expr => typeof expr === "object" && 'error' in expr);
        if (firstError) return firstError;

        const [condition, trueValue, falseValue] = expressions;
        if (condition !== ExpressionType.Boolean) return { error: 'The first parameter to a IF() function must be a boolean' };
        if (trueValue !== falseValue) return { error: 'The last two parameters of an IF() function must be the same type (number, string or boolean).' };
    }

    return { error: 'Not implemented! :P' };
}