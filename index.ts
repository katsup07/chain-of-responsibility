// Note: 複雑な所は、polymorphism, recursion,　and chain of responsibilityの実装である。理解できないなら、
// それぞれの概念を学ぶ必要があるかもしれない。使っているところでコメントを残しているので、それを参考にしてください。

// メーンポイント
// このファイルは、責任の連鎖（Chain of Responsibility）パターンを示している。
// 各リンク（AuthLink、ErrorLink、HttpLink）は、Operationオブジェクトを処理し、次のリンクに渡す。
// LinkChainクラスは、これらのリンクを順番に実行する役割を持つ。
// main関数では、AuthLink、ErrorLink、HttpLinkの順にリンクを設定し、Operationを実行する。
// AuthLinkがエラーを投げる設定になっているため、ErrorLinkがそのエラーをキャッチし、エラーメッセージを返す。
// 最後に、結果がコンソールに出力される。

// executeChain関数は再帰的です。次のインデックスで自分自身を呼び出すことで、チェーン内の各リンクを処理します。
// AuthLinkがエラーを投げると、そのエラーはコールスタックを通じて前の関数呼び出し（ErrorLink）に伝播します。
// これは、ErrorLinkのtry-catchブロックでエラーがキャッチされるまで、コールスタック内のすべての関数に当てはまります。
// これが、他のリンクが投げるエラーをキャッチしたい場合に、ErrorLinkをチェーンの最初に配置する必要がある理由です。
// 基本的に、ErrorLinkはすべてのforward呼び出しをtry-catchブロックでラップして、後続のリンクが投げるエラーを処理します。
// これは、Chain of Responsibilityパターンの一例です。各リンクはOperationオブジェクトを処理し、次のリンクに渡します。

// 例のケース
// 1.  const errorData = { isThrowAuthError: true };
// const chain = new LinkChain([new AuthLink(errorData), new ErrorLink(), new HttpLink()]); 
// 結果: ErrorLinkがエラーをキャッチできない。エラーがmain関数まで伝播する。AuthLinkがErrorLinkの前にあるので、ErrorLinkは処理できない。

// 2. const errorData = { isThrowAuthError: true };
// const chain = new LinkChain([new ErrorLink(), new AuthLink(errorData), new HttpLink()]); 
// 結果: ErrorLinkがエラーをキャッチで処理できる。理由、ErrorLinkがAuthLinkの前にあるため、エラーがErrorLinkに渡る。
// リンクの順番が重要であることを示している。エラーをキャッチするリンクは、他のリンクの前に配置する必要がある。

// 3. const errorData = { isThrowAuthError: false };　// エラーを発生させない場合
// 結果: AuthLinkがエラーを投げないため、HttpLinkが実行される。


interface Operation {
  query: string;
}

type NextLink = (operation: Operation) => any;

// ポリモーフィズムをつかうため、Linkインターフェースを作成する。
// 各Linkクラスはこのインターフェースを実装する
interface Link {
  execute(operation: Operation, forward: NextLink): any;
}

class ErrorLink implements Link {
  execute(operation: Operation, forward: NextLink): any {
    console.log("[ErrorLink] Running execute...");
    try {
      //　次のリンクに処理を渡す
      return forward(operation);
    } catch (error) {
      console.error(`[ErrorLink]: ${(error as Error).message}`);
      return { error: (error as Error).message };
    }
  }
}

class AuthLink implements Link {
  constructor(private data: { isThrowAuthError: boolean}) {}

  execute(operation: Operation, forward: NextLink): any {
    console.log("[AuthLink] Running execute...");
    // わざとエラーを発生させる
    if(this.data.isThrowAuthError)
      throw new Error("Authentication failed: No token found");
    //　次のリンクに処理を渡す
    return forward(operation);
  }
}

class HttpLink implements Link {
  execute(operation: Operation, forward: NextLink): any {
    console.log(`[HttpLink]: Request sent with query "${operation.query}"`);
    return { data: "Query was processed successfully" };
  }
}

class LinkChain {
  constructor(private links: Link[]) {}

  execute(operation: Operation): any {
    const executeChain = (index: number, op: Operation): any => {
      if (index >= this.links.length) return null;

      const link = this.links[index]; // 例: [(0) errorLink , (1) authLink , (2) httpLink]
      const forward = (nextOp: Operation) => executeChain(index + 1, nextOp); //次のリンクに処理を渡すための再帰的なコールバック
      return link.execute(op, forward); //ポリモーフィズムで各リンクのexecuteメソッドが呼ばれる
    };

    return executeChain(0, operation);
  }
}

// Main - チェーンの実行
const main = () => {

const errorData = { isThrowAuthError: false }; // ここでエラーを発生させるかどうかを設定する
const chain = new LinkChain([new ErrorLink(), new AuthLink(errorData), new HttpLink()]); // チェーンの設定

const operation = { query: "Some GraphQL Query" };

try{
const result = chain.execute(operation);
// チェーン内でエラーが発生した場合、エラーをキャッチしてログに出力する
if (result && result.error)
  console.log(`[Main] Error handled: ${result.error}`);
else
  console.log(`[Main] Result: ${JSON.stringify(result)}`);
} catch(error){
  // チェーン内でエラーがキャッチされなかった場合、エラーをキャッチしてログに出力する。
  console.error(`[Main]: Error was not handled in LinkChain and propagated to main. Error: ${(error as Error).message}`);
}
};

main();

// The executeChain function is recursive. It processes each link in the chain by calling itself with the next index.
// When AuthLink throws an error, the error propagates back through the call stack to the previous function call, which is ErrorLink.
// This is true for all functions in the call stack until the error is caught by the try-catch block in ErrorLink. 
// This is why ErrorLink should come first in the chain if you wish to catch errors thrown by other links.
// Essentially, ErrorLink wraps all the forward call in a try-catch block to handle any errors thrown by subsequent links.
// This is the chain of responsibility pattern in action. Each link is responsible for handling a specific operation and passing it to the next link in the chain.

// executeChain関数は再帰的です。次のインデックスで自分自身を呼び出すことで、チェーン内の各リンクを処理します。
// AuthLinkがエラーを投げると、そのエラーはコールスタックを通じて前の関数呼び出し（ErrorLink）に伝播します。
// これは、ErrorLinkのtry-catchブロックでエラーがキャッチされるまで、コールスタック内のすべての関数に当てはまります。
// これが、他のリンクが投げるエラーをキャッチしたい場合に、ErrorLinkをチェーンの最初に配置する必要がある理由です。
// 基本的に、ErrorLinkはすべてのforward呼び出しをtry-catchブロックでラップして、後続のリンクが投げるエラーを処理します。
// これは、Chain of Responsibilityパターンの一例です。各リンクはOperationオブジェクトを処理し、次のリンクに渡します。