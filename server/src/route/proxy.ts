import * as express from "express";
import * as mime from "mime-types";
import * as crypto from "crypto";
import { AppServer } from "../server";
import { GithubClient } from "../github";
import { SessionData } from "../model/session";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /proxy/{owner}/{repo}/{branch}/{path}/{file} Access repo file
 * @apiVersion 0.0.1
 * @apiName get
 * @apiGroup repo
 * @apiDescription Fetch a file from repo, indicated by uri.
 */
function repo_proxy(req: express.Request, res: express.Response) {
    // console.log(`repo_proxy: ${req.originalUrl}`);
    // const self: AppServer = this;
    const session = SessionData.bind(req.session);

    if (!session.access_token) {
        // Redirect to github oauth if not logged in already
        session.returning_url = process.env.APP_SERVER_BASE + req.originalUrl;
        const github = new GithubClient("");
        const secret = crypto.randomBytes(16);
        const oauth_state = Buffer.from(secret).toString("hex");
        session.oauth_state = oauth_state;
        res.redirect(github.get_oauth_url(oauth_state));
        return;
    }

    // Fetch content from github and return with correct mimetype
    const fields = req.originalUrl.split("/");
    const owner = fields[2];
    const repo = fields[3];
    const branch = fields[4];
    const file = fields.slice(5).join("/");
    const github = new GithubClient(session.access_token);
    github.user_file(owner, repo, branch, file, (code: number, data: any) => {
        if (data) {
            res.type(mime.lookup(file) || "text/html");
            res.status(code).send(data);
        } else {
            res.status(code).send("Not found");
        }
    });
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/proxy/*",
    "get": repo_proxy
};
}());
