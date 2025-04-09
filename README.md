# cafe24-link-opener README

## Description / 소개

**[English]**  
Cafe24 Link Opener is a Visual Studio Code extension designed for Cafe24 no-code tool projects. It enables clickable file links within custom HTML comments (such as `<!--@layout(/path/to/file)-->`) so you can quickly open the referenced file. The extension also provides autocompletion for both comment keywords and file paths.

**[한국어]**  
Cafe24 Link Opener는 Cafe24 노코드 툴 프로젝트를 위해 제작된 VS Code 익스텐션입니다. 이 확장은 `<!--@layout(/path/to/file)-->` 같은 커스텀 HTML 주석 내의 파일 링크를 클릭하면 해당 파일을 바로 열 수 있도록 하며, 주석 키워드 및 파일 경로 자동완성 기능도 제공합니다.

## Features / 기능

**[English]**

-   **Clickable File Links:**  
    Automatically converts custom HTML comments (e.g., `<!--@js(/tounou/js/dwa/redirect.js)-->`) into clickable links that open the referenced file in your editor.

-   **Keyword Autocompletion:**  
    When you type `<!--@`, the extension suggests comment templates like:

    -   `<!--@import()-->`
    -   `<!--@js()-->`
    -   `<!--@layout()-->`
    -   `<!--@css()-->`

-   **File Path Autocompletion:**  
    Within the comment syntax (`<!--@keyword(`), typing a file path (e.g., `path1/`) triggers autocompletion for files and directories found in the specified location. This works recursively for deeper paths (like `path1/path2/`).

**[한국어]**

-   **파일 링크 클릭 기능:**  
    커스텀 HTML 주석(예: `<!--@js(/tounou/js/dwa/redirect.js)-->`)을 클릭 가능한 링크로 변환하여 관련 파일을 바로 열 수 있습니다.

-   **키워드 자동완성:**  
    `<!--@`를 입력하면 아래와 같은 주석 템플릿들이 제안됩니다.

    -   `<!--@import()-->`
    -   `<!--@js()-->`
    -   `<!--@layout()-->`
    -   `<!--@css()-->`

-   **파일 경로 자동완성:**  
    주석 내에 `<!--@keyword(` 이후에 파일 경로를 입력하면 (예: `path1/` 또는 `path1/path2/`), 해당 경로에 존재하는 파일 및 디렉토리 목록을 자동으로 표시하여 선택할 수 있도록 도와줍니다.

## Requirements / 요구 사항

**[English]**

-   Visual Studio Code (latest version recommended)
-   Node.js installed for developing or building the extension

**[한국어]**

-   최신 버전의 Visual Studio Code
-   익스텐션 개발이나 빌드를 위한 Node.js 설치

## Extension Settings / 확장 설정

**[English]**  
This extension does not require any custom configuration settings.

**[한국어]**  
이 익스텐션은 별도의 설정을 필요로 하지 않습니다.

## Known Issues / 알려진 이슈

**[English]**

-   No major issues reported at this time.
-   If file path autocompletion does not work as expected, please check your workspace folder structure.

**[한국어]**

-   현재까지 주요 이슈는 보고되지 않았습니다.
-   파일 경로 자동완성 기능에 문제가 있을 경우, 작업 공간의 폴더 구조를 확인해 주세요.

## Release Notes / 릴리즈 노트

**[English]**

### 1.0.0

-   Initial release with clickable file links, keyword autocompletion, and file path suggestions.

**[한국어]**

### 1.0.0

-   클릭 가능한 파일 링크, 키워드 자동완성, 파일 경로 자동완성 기능을 포함한 초기 릴리즈.

## License / 라이선스

**[English]**  
This project is licensed under the MIT License.

**[한국어]**  
이 프로젝트는 MIT 라이선스 하에 배포됩니다.
