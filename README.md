Note: 複雑な所は、polymorphism, recursion, and chain of responsibilityの実装である。理解できないなら、
それぞれの概念を学ぶ必要があるかもしれない。使っているところでコメントを残しているので、それを参考にしてください。

メーンポイント
このファイルは、責任の連鎖（Chain of Responsibility）パターンを示している。
各リンク（AuthLink、ErrorLink、HttpLink）は、Operationオブジェクトを処理し、次のリンクに渡す。
LinkChainクラスは、これらのリンクを順番に実行する役割を持つ。
main関数では、AuthLink、ErrorLink、HttpLinkの順にリンクを設定し、Operationを実行する。
AuthLinkがエラーを投げる設定になっているため、ErrorLinkがそのエラーをキャッチし、エラーメッセージを返す。
最後に、結果がコンソールに出力される。

再帰的な処理
executeChain関数は再帰的です。次のインデックスで自分自身を呼び出すことで、チェーン内の各リンクを処理します。
AuthLinkがエラーを投げると、そのエラーはコールスタックを通じて前の関数呼び出し（ErrorLink）に伝播します。
ErrorLinkのtry-catchブロックでエラーがキャッチされるまで、コールスタック内のすべての関数に当てはまります。
他のリンクが投げるエラーをキャッチしたい場合に、ErrorLinkをそのチェーンの最初に配置する必要がある理由です。
基本的に、ErrorLinkはすべてのforwardコールをtry-catchブロックでラップして、後続のリンクが投げるエラーを処理します。

Chair of Responsibilityパターン
これは、Chain of Responsibilityパターンの一例です。各リンクはOperationオブジェクトを処理し、次のリンクに渡します。

例のケース
1.  const errorData = { isThrowAuthError: true };
const chain = new LinkChain([new AuthLink(errorData), new ErrorLink(), new HttpLink()]); 
結果: ErrorLinkがエラーをキャッチできない。エラーがmain関数まで伝播する。AuthLinkがErrorLinkの前にあるので、ErrorLinkは処理できない。

2. const errorData = { isThrowAuthError: true };
const chain = new LinkChain([new ErrorLink(), new AuthLink(errorData), new HttpLink()]); 
結果: ErrorLinkがエラーをキャッチで処理できる。理由、ErrorLinkがAuthLinkの前にあるため、エラーがErrorLinkに渡る。
リンクの順番が重要であることを示している。エラーをキャッチするリンクは、他のリンクの前に配置する必要がある。

3. const errorData = { isThrowAuthError: false };　// エラーを発生させない場合
結果: AuthLinkがエラーを投げないため、HttpLinkが実行される。

[Video Demo of Test Cases](https://www.youtube.com/watch?v=4yG2YBAsaYY) 

``` 
// 再帰的な処理が理解できない場合は、以下の主なアイデアを参考にしてください:
// 責任の連鎖パターンにおいて、リンク間で操作を転送します。

// チェーンの最初のリンク
function errorLinkExecute(op: Operation) {
    // チェーンの開始
    try {
        authLinkExecute(op); // 次のリンクに転送
    } catch (error) {
        console.log(error); // 下流のリンクで発生したエラーを処理
    }
}

// チェーンの2番目のリンク
function authLinkExecute(op: Operation) {
    // 認証ロジックを実行
    // ...
    httpLinkExecute(op); // 次のリンクに転送
}

// チェーンの3番目のリンク
function httpLinkExecute(op: Operation) {
    // サーバーにリクエストを送信し、応答を待つ
}

// チェーンの開始
const operation = { query: "Some GraphQL Query" };
errorLinkExecute(operation);
```
