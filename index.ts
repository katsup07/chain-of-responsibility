// Chain of Responsibility Pattern

// メインポイント
// このファイルは、Chain of Responsibility Patternを示している。
// 各リンク（AuthLink、ErrorLink、HttpLink）は、Operationオブジェクトを処理し、次のリンクに渡す。
// LinkChainクラスは、これらのリンクを順番に実行する。
// main関数では、AuthLink、ErrorLink、HttpLinkの順にリンクを設定し、Operationを実行する。
// AuthLinkがエラーを投げる設定になっているため、ErrorLinkがそのエラーをキャッチできるし、エラーメッセージを返す。
// 最後に、結果がコンソールに出力される。

// 再帰的な処理
// executeChain関数は再帰的。次のインデックスで自分自身を呼び出すことで、チェーン内の各リンクを処理する。
// AuthLinkがエラーを投げると、そのエラーはコールスタックを通じて前の関数呼び出し（ErrorLink）に伝播する。
// ErrorLinkのtry-catchブロックでエラーがキャッチされるまで、コールスタック内のすべての関数に当てはまる。
// 他のリンクが投げるエラーをキャッチしたい場合、ErrorLinkをチェーンの最初に配置する必要がある。
// 基本的に、ErrorLinkはすべてのforwardコールをtry-catchブロックでラップして、後続のリンクが投げるエラーを処理する。

interface Operation {
  query: string;
}

type NextLink = (operation: Operation) => any;

// ポリモーフィズムをつかうため、各Linkクラスはこのインターフェースを実装する
interface Link {
  execute(operation: Operation, forward: NextLink);
}

class ErrorLink implements Link {
  execute(operation: Operation, forward: NextLink) {
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

  execute(operation: Operation, forward: NextLink) {
    console.log("[AuthLink] Running execute...");
    // わざとエラーを発生させる
    if(this.data.isThrowAuthError)
      throw new Error("Authentication failed: No token found");
    //　次のリンクに処理を渡す
    return forward(operation);
  }
}

class HttpLink implements Link {
  execute(operation: Operation, forward: NextLink) {
    console.log("[HttpLink] Running execute...");

    console.log(`[HttpLink]: Request sent with query "${operation.query}"`);
    return { data: "Query was processed successfully" };
  }
}

class LinkChain {
  constructor(private links: Link[]) {}

  execute(operation: Operation) {
    const executeChain = (index: number, op: Operation) => {
      if (index >= this.links.length) return null;

      const link = this.links[index]; // 例: [(0) errorLink , (1) authLink , (2) httpLink]
      const forward = (nextOp: Operation) => executeChain(index + 1, nextOp); //再帰的なコールバック
      return link.execute(op, forward); //ポリモーフィズムで各リンクのexecuteメソッドが呼ばれる
    };

    return executeChain(0, operation);
  }
}


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
// Video - https://www.youtube.com/watch?v=4yG2YBAsaYY

// Main - チェーンの実行
const main = () => {

const authData = { isThrowAuthError: true }; // エラーの設定
const chain = new LinkChain([new ErrorLink(), new AuthLink(authData), new HttpLink()]); // チェーンの設定

const operation = { query: "Some GraphQL Query" };

try{
const result = chain.execute(operation);
// チェーン内でエラーがキャッチされた場合
if (result && result.error)
  console.log(`[Main] Error handled in LinkChain: ${result.error}`);
else
  console.log(`[Main] Result: ${JSON.stringify(result)}`);
} catch(error){
  // チェーン内でエラーがキャッチされなかった場合
  console.error(`[Main]: Error was not handled in LinkChain and propagated to main. Error: ${(error as Error).message}`);
}
};

main();