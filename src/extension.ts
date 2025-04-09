import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";

export function activate(context: vscode.ExtensionContext) {
    // HTML 파일에 적용할 DocumentLinkProvider 등록
    const htmlLinkProvider: vscode.DocumentLinkProvider = {
        provideDocumentLinks(document, token) {
            const text = document.getText();
            const regex = /<!--@\w+\((.*?)\)-->/g;
            const links: vscode.DocumentLink[] = [];
            let match: RegExpExecArray | null;

            while ((match = regex.exec(text)) !== null) {
                // 전체 주석 텍스트와 괄호 안의 파일 경로
                const fullMatch = match[0];
                const filePath = match[1];

                // 문서 내 주석의 시작, 끝 위치 계산
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + fullMatch.length);

                let targetUri: vscode.Uri | undefined;

                // 파일 경로가 '/'로 시작한다면 워크스페이스 루트로부터의 경로로 간주
                if (filePath.startsWith("/")) {
                    if (
                        vscode.workspace.workspaceFolders &&
                        vscode.workspace.workspaceFolders.length > 0
                    ) {
                        targetUri = vscode.Uri.joinPath(
                            vscode.workspace.workspaceFolders[0].uri,
                            filePath
                        );
                    }
                } else {
                    // 상대 경로인 경우 현재 문서의 디렉토리를 기준으로 처리
                    const currentDir = path.dirname(document.uri.fsPath);
                    targetUri = vscode.Uri.file(path.join(currentDir, filePath));
                }

                if (targetUri) {
                    // DocumentLink 생성: 범위와 targetUri 연결
                    const link = new vscode.DocumentLink(
                        new vscode.Range(startPos, endPos),
                        targetUri
                    );
                    links.push(link);
                }
            }

            return links;
        },
    };

    // HTML 문서에 대해 링크 프로바이더를 등록 (파일 스킴으로만 제한)
    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            { language: "html", scheme: "file" },
            htmlLinkProvider
        )
    );

    // CompletionItemProvider 등록
    const completionProvider: vscode.CompletionItemProvider = {
        provideCompletionItems(document, position, token, context) {
            // 현재 라인의 텍스트를 가져와서 해당 위치까지의 문자열을 확인
            const linePrefix = document.lineAt(position).text.substr(0, position.character);

            // 만약 사용자가 "<!--@"를 입력한 상태가 아니라면 자동완성을 제공하지 않음
            if (!linePrefix.endsWith("<!--@")) {
                return undefined;
            }

            // 자동완성으로 제안할 항목들
            const completions = ["import", "js", "layout", "css"].map((keyword) => {
                const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Snippet);
                // 선택 시 자동으로 "keyword()-->" 형태로 삽입됨
                item.insertText = new vscode.SnippetString(keyword + "($0)--");
                item.detail = `Insert <!--@${keyword}()-->`;
                return item;
            });

            return completions;
        },
    };

    // '@' 캐릭터가 trigger일 경우 자동완성을 실행하도록 등록.
    // (여기선 '<!--@'가 입력된 상태일 때 자동완성을 제공하기 때문에, trigger로 '@'를 지정함)
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: "html", scheme: "file" },
            completionProvider,
            "@"
        )
    );

    // 추가: 파일 및 디렉토리 경로 자동완성 제공
    const filePathCompletionProvider: vscode.CompletionItemProvider = {
        async provideCompletionItems(document, position, token, completionContext) {
            // 해당 위치까지의 라인 텍스트 추출
            const lineText = document.lineAt(position).text.substr(0, position.character);

            // "keyword(" 이후부터 커서까지의 부분을 찾아야 함.
            // 예: <!--@js(path/to/dir
            // 정규표현식으로 "('<!--@<any_keyword>('부분 이후 남은 문자열)을 추출.
            const regex = /<!--@\w+\(([^)]*)$/;
            const match = regex.exec(lineText);
            if (!match) {
                return undefined;
            }

            let partialPath = match[1]; // 사용자가 입력 중인 경로 (예: "path1/path2")

            // 기본 디렉토리 결정: 입력된 경로가 '/'로 시작하면 워크스페이스 루트를, 아니면 현재 파일의 디렉토리를 기준으로 함
            let baseDir: string;
            if (partialPath.startsWith("/")) {
                if (
                    vscode.workspace.workspaceFolders &&
                    vscode.workspace.workspaceFolders.length > 0
                ) {
                    baseDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
                    // 이미 절대경로임을 가정하고 앞의 '/'는 제거
                    partialPath = partialPath.slice(1);
                } else {
                    return undefined;
                }
            } else {
                baseDir = path.dirname(document.uri.fsPath);
            }

            // partialPath에서 마지막 '/'를 기준으로 현재 입력 중인 폴더 경로와 그 이후(완성될 항목의 접두어)를 분리
            const lastSlashIndex = partialPath.lastIndexOf("/");
            let dirPart = partialPath;
            let prefix = "";
            if (lastSlashIndex !== -1) {
                prefix = partialPath.substring(lastSlashIndex + 1);
                dirPart = partialPath.substring(0, lastSlashIndex + 1); // 마지막 '/' 포함
            }

            const currentDir = path.join(baseDir, dirPart);

            let entries: string[];
            try {
                // 현재 디렉토리가 존재하는지 확인
                const stat = await fs.stat(currentDir);
                if (!stat.isDirectory()) {
                    return undefined;
                }
                entries = await fs.readdir(currentDir);
            } catch (error) {
                return undefined;
            }

            // 폴더 내 항목 중에서 prefix로 시작하는 항목만 제안하고, 각 항목에 대해 CompletionItem 생성
            const completionItemsPromises = entries
                .filter((entry) => entry.startsWith(prefix))
                .map(async (entry) => {
                    const fullPath = path.join(currentDir, entry);
                    const stats = await fs.stat(fullPath);
                    const isDir = stats.isDirectory();
                    const item = new vscode.CompletionItem(
                        entry,
                        isDir ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File
                    );
                    // 폴더인 경우 자동으로 끝에 '/'를 붙여서 계속 입력할 수 있도록 지원
                    item.insertText = isDir ? entry + "/" : entry;
                    item.detail = isDir ? "Directory" : "File";
                    return item;
                });

            return Promise.all(completionItemsPromises);
        },
    };

    // 트리거 문자로 '/'와 '\' (윈도우의 경우)도 지정해 두면 유용함
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: "html", scheme: "file" },
            filePathCompletionProvider,
            "/",
            "\\"
        )
    );
}

export function deactivate() {}
