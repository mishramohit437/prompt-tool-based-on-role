declare module '@langchain/langgraph' {
  export class StateGraph<S> {
    addNode(name: string, fn: (state: S) => Promise<S> | S): void;
    addEdge(from: string, to: string): void;
    addConditionalEdges(from: string, router: (state: S) => string): void;
    compile(): {
      invoke(state: S): Promise<S>;
    };
  }
}

