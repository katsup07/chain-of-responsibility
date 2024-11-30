// このファイルは、責任の連鎖（Chain of Responsibility）パターンを示している。
// 各リンク（AuthLink、ErrorLink、HttpLink）は、Operationオブジェクトを処理し、次のリンクに渡す。
// LinkChainクラスは、これらのリンクを順番に実行する役割を持つ。
// main関数では、AuthLink、ErrorLink、HttpLinkの順にリンクを設定し、Operationを実行する。
// AuthLinkがエラーを投げる設定になっているため、ErrorLinkがそのエラーをキャッチし、エラーメッセージを返す。
// 最後に、結果がコンソールに出力される。
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
            var link = _this.links[index]; // [(0) errorLink , (1) authLink , (2) httpLink]
            var forward = function (nextOp) { return executeChain(index + 1, nextOp); };
            return link.execute(op, forward); // ポリモーフィズムで各リンクのexecuteメソッドが呼ばれる
        };
        return executeChain(0, operation);
    };
    return LinkChain;
}());
// Main - チェーンの実行
var main = function () {
    var errorData = { isThrowAuthError: false }; // ここでエラーを発生させるかどうかを設定する
    var chain = new LinkChain([new ErrorLink(), new AuthLink(errorData), new HttpLink()]);
    var operation = { query: "Some GraphQL Query" };
    try {
        var result = chain.execute(operation);
        if (result && result.error)
            console.log("[Main] Error handled: ".concat(result.error));
        else
            console.log("[Main] Result: ".concat(JSON.stringify(result)));
    }
    catch (error) {
        console.error("[Main]: Error was not handled in LinkChain and propagated to main. Error: ".concat(error.message));
    }
};
main();
