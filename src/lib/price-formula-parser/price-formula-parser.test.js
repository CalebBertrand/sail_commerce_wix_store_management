// @ts-nocheck
const { describe, expect, it } = require('@jest/globals');
const { parseExpressionString } = require('./price-formula-parser');

describe('The expression parser', () => {
    const sampleOptions = [
        {
            name: "Material",
            order: 1,
            type: "Select"
        },
        {
            name: "Width",
            order: 2,
            type: "Number"
        }
    ];

    it('Should return an error message if the first expression is gibberish.', () => {
        const formula = "sdfaj safo adjsf";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('string');
    });

    /** Literal Values */

    it('Should return an expression of a literal number if the input is just a integer.', () => {
        const formula = "55";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(false);
        expect(result.value).toBe("55");
    });

    it('Should return an expression of a literal number if the input is just a decimal.', () => {
        const formula = "55.0";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(false);
        expect(result.value).toBe("55.0");
    });

    it('Should return an expression of a literal string if the input is just a string.', () => {
        const formula = '"My String"';
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(false);
        expect(result.value).toBe("My String");
    });

    /** Unary Expressions */

    it('Should return a unary expression for subtraction.', () => {
        const formula = "45.7 - 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("-");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should return a unary expression for addition.', () => {
        const formula = "45.7 + 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("+");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should return a unary expression for multiplication.', () => {
        const formula = "45.7 * 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("*");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should return a unary expression for division.', () => {
        const formula = "45.7 / 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("/");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should return a unary expression for equality checks.', () => {
        const formula = "45.7 = 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("=");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should return a unary expression for greater than checks.', () => {
        const formula = "45.7 > 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe(">");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should return a unary expression for less than checks.', () => {
        const formula = "45.7 < 55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("<");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    /** Whitespace */

    it('Should behave the same if there is no whitespace.', () => {
        const formula = "45.7<55.4";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("<");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    it('Should behave the same if there is extra whitespace.', () => {
        const formula = " 45.7  <  55.4   ";
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Unary');
        expect(result.unaryOperation).toBe("<");

        expect(result.leftHand.isComposite).toBe(false);
        expect(result.leftHand.value).toBe("45.7");

        expect(result.rightHand.isComposite).toBe(false);
        expect(result.rightHand.value).toBe("55.4");
    });

    /** IF() Function */

    it('Should return an expression of the same type as the true and false expressions.', () => {
        const formula = 'IF(5 = 5, "True", "False")';
        const result = parseExpressionString(formula, sampleOptions);

        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Turnary');

        expect(result.conditionalExpression.operationType).toBe('Unary');
        expect(result.conditionalExpression.isComposite).toBe(true);
        expect(result.conditionalExpression.unaryOperation).toBe('=');

        expect(result.trueExpression.isComposite).toBe(false);
        expect(result.trueExpression.value).toBe("True");

        expect(result.falseExpression.isComposite).toBe(false);
        expect(result.falseExpression.value).toBe("False");
    });

    it('Should return an error if the type of the true and false expressions are not the same.', () => {
        const formula = 'IF(5 = 5, 56, "False")';
        const result = parseExpressionString(formula, sampleOptions);

        expect(typeof result).toBe('string');
    });

    it('Should return an error if the type of the condition expression is not boolean.', () => {
        const formula = 'IF(5, "True", "False")';
        const result = parseExpressionString(formula, sampleOptions);

        expect(typeof result).toBe('string');
    });

    /** Options */

    it('Should return an expression of a string literal if the option was of type Select.', () => {
        const formula = 'OPTIONS["Material"]';
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(false);
        expect(result.optionName).toBe("Material");
        expect(result.type).toBe("String");
    });

    it('Should return an expression of a number literal if the option was of type Number.', () => {
        const formula = 'OPTIONS["Width"]';
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(false);
        expect(result.optionName).toBe("Width");
        expect(result.type).toBe("Number");
    });

    it('Should return an error if no options match the string passed in.', () => {
        const formula = 'OPTIONS["Not Real"]';
        const result = parseExpressionString(formula, sampleOptions);
        expect(typeof result).toBe('string');
    });

    /** Nested Expressions */

    it('Should behave consistently with nested expressions, pt 1.', () => {
        const formula = 'IF(5 = 4, "True", IF(5 = 5, "True", "False"))';
        const result = parseExpressionString(formula, sampleOptions);

        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Turnary');

        const outerConditional = result.conditionalExpression;
        expect(outerConditional.isComposite).toBe(true);
        expect(outerConditional.operationType).toBe('Unary');
        expect(outerConditional.unaryOperation).toBe('=');
        expect(outerConditional.leftHand.isComposite).toBe(false);
        expect(outerConditional.leftHand.value).toBe("5");
        expect(outerConditional.rightHand.isComposite).toBe(false);
        expect(outerConditional.rightHand.value).toBe("4");

        const outerTrue = result.trueExpression;
        expect(outerTrue.isComposite).toBe(false);
        expect(outerTrue.value).toBe("True");

        const outerFalse = result.falseExpression;
        expect(outerFalse.isComposite).toBe(true);
        expect(outerFalse.operationType).toBe('Turnary');

        const innerConditional = outerFalse.conditionalExpression;
        expect(innerConditional.isComposite).toBe(true);
        expect(innerConditional.operationType).toBe('Unary');
        expect(innerConditional.unaryOperation).toBe('=');
        expect(innerConditional.leftHand.isComposite).toBe(false);
        expect(innerConditional.leftHand.value).toBe("5");
        expect(innerConditional.rightHand.isComposite).toBe(false);
        expect(innerConditional.rightHand.value).toBe("5");

        const innerTrue = outerFalse.trueExpression;
        expect(innerTrue.isComposite).toBe(false);
        expect(innerTrue.value).toBe("True");

        const innerFalse = outerFalse.falseExpression;
        expect(innerFalse.isComposite).toBe(false);
        expect(innerFalse.value).toBe("False");
    });

    it('Should behave consistently with nested expressions, pt 2.', () => {
        const formula = 'IF(OPTIONS["Material"] = "Wood", 5, 7) + 3.14';
        const result = parseExpressionString(formula, sampleOptions);

        expect(typeof result).toBe('object');
        expect(result.isComposite).toBe(true);
        expect(result.operationType).toBe('Number');
        expect(result.numberOperation).toBe('+');

        const leftHand = result.leftHand;
        expect(leftHand.isComposite).toBe(true);
        expect(leftHand.operationType).toBe('Turnary');

        const conditional = leftHand.conditionalExpression;
        expect(conditional.isComposite).toBe(true);
        expect(conditional.operationType).toBe('Unary');
        expect(conditional.unaryOperation).toBe('=');

        const conditionalLeftHand = conditional.leftHand;
        expect(conditionalLeftHand.isComposite).toBe(false);
        expect(conditionalLeftHand.optionName).toBe("Material");

        const conditionalRightHand = conditional.rightHand;
        expect(conditionalRightHand.isComposite).toBe(false);
        expect(conditionalRightHand.value).toBe("Wood");

        const trueExpression = leftHand.trueExpression;
        expect(trueExpression.isComposite).toBe(false);
        expect(trueExpression.value).toBe("5");

        const falseExpression = leftHand.falseExpression;
        expect(falseExpression.isComposite).toBe(false);
        expect(falseExpression.value).toBe("7");

        const rightHand = result.rightHand;
        expect(rightHand.isComposite).toBe(false);
        expect(rightHand.value).toBe("3.14");
    })
});