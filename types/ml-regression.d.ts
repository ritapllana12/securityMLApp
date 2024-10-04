declare module 'ml-logistic-regression' {
    export default class LogisticRegression {
      constructor(options: { numSteps?: number; learningRate?: number; });
      train(X: number[][], y: number[]): void;
      predict(X: number[][]): number[];
    }
  }
  