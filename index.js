// Chain of Responsibility Pattern
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
        console.log("[HttpLink] Running execute...");
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
            var forward = function (nextOp) { return executeChain(index + 1, nextOp); }; //再帰的なコールバック
            return link.execute(op, forward); //ポリモーフィズムで各リンクのexecuteメソッドが呼ばれる
        };
        return executeChain(0, operation);
    };
    return LinkChain;
}());
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
var main = function () {
    var authData = { isThrowAuthError: true }; // エラーの設定
    var chain = new LinkChain([new ErrorLink(), new AuthLink(authData), new HttpLink()]); // チェーンの設定
    var operation = { query: "Some GraphQL Query" };
    try {
        var result = chain.execute(operation);
        // チェーン内でエラーがキャッチされた場合
        if (result && result.error)
            console.log("[Main] Error handled in LinkChain: ".concat(result.error));
        else
            console.log("[Main] Result: ".concat(JSON.stringify(result)));
    }
    catch (error) {
        // チェーン内でエラーがキャッチされなかった場合
        console.error("[Main]: Error was not handled in LinkChain and propagated to main. Error: ".concat(error.message));
    }
};
main();
