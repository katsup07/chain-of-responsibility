// Note: 複雑な所は、polymorphism, recursion, and chain of responsibilityの実装である。理解できないなら、
// それぞれの概念を学ぶ必要があるかもしれない。使っているところでコメントを残しているので、それを参考にしてください。
var ErrorLink = /** @class */ (function () {
    function ErrorLink() {
    }
    ErrorLink.prototype.execute = function (operation, forward) {
        console.log("[ErrorLink] Running execute...");
        try {
            //　次のリンクに処理を渡す
            return forward(operation);
        }
        catch (error) {
            console.error("[ErrorLink]: ".concat(error.message));
            return { error: error.message };
        }
    };
    return ErrorLink;
}());
var AuthLink = /** @class */ (function () {
    function AuthLink(data) {
        this.data = data;
    }
    AuthLink.prototype.execute = function (operation, forward) {
        console.log("[AuthLink] Running execute...");
        // わざとエラーを発生させる
        if (this.data.isThrowAuthError)
            throw new Error("Authentication failed: No token found");
        //　次のリンクに処理を渡す
        return forward(operation);
    };
    return AuthLink;
}());
var HttpLink = /** @class */ (function () {
    function HttpLink() {
    }
    HttpLink.prototype.execute = function (operation, forward) {
        console.log("[HttpLink]: Request sent with query \"".concat(operation.query, "\""));
        return { data: "Query was processed successfully" };
    };
    return HttpLink;
}());
var LinkChain = /** @class */ (function () {
    function LinkChain(links) {
        this.links = links;
    }
    LinkChain.prototype.execute = function (operation) {
        var _this = this;
        var executeChain = function (index, op) {
            if (index >= _this.links.length)
                return null;
            var link = _this.links[index]; // 例: [(0) errorLink , (1) authLink , (2) httpLink]
            var forward = function (nextOp) { return executeChain(index + 1, nextOp); }; //次のリンクに処理を渡すための再帰的なコールバック
            return link.execute(op, forward); //ポリモーフィズムで各リンクのexecuteメソッドが呼ばれる
        };
        return executeChain(0, operation);
    };
    return LinkChain;
}());
// Main - チェーンの実行
var main = function () {
    var errorData = { isThrowAuthError: true }; // ここでエラーを発生させるかどうかを設定する
    var chain = new LinkChain([new ErrorLink(), new AuthLink(errorData), new HttpLink()]); // チェーンの設定
    var operation = { query: "Some GraphQL Query" };
    try {
        var result = chain.execute(operation);
        // チェーン内でエラーが発生した場合、エラーをキャッチしてログに出力する
        if (result && result.error)
            console.log("[Main] Error safely handled: ".concat(result.error));
        else
            console.log("[Main] Result: ".concat(JSON.stringify(result)));
    }
    catch (error) {
        // チェーン内でエラーがキャッチされなかった場合、エラーをキャッチしてログに出力する。
        console.error("[Main]: Error was not handled in LinkChain and propagated to main. Error: ".concat(error.message));
    }
};
main();
