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
