declare module '@langchain/langgraph' {
  export const END: string;

  export class StateGraph<S> {
    addNode(name: string, fn: (state: S) => Promise<S> | S): void;
    addEdge(from: string, to: string): void;
    addConditionalEdge(from: string, router: (state: S) => string): void;
    compile(): {
      invoke(state: S): Promise<S>;
    };
  }
}
