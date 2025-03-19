/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testPathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/tests/gemini.test.ts",
        "<rootDir>/src/services/geminiService.ts",
    ],
};