let GAS_URL = null;
let enemyImage = null;

async function loadConfig() {
    try {
        const response = await fetch('./non-share.json');
        if (!response.ok) {
            throw new Error('ファイルが見つかりません');
        }
        const config = await response.json();
        console.log("ok");
        //console.log(config);

        GAS_URL = config.GAS_url;
        enemyImage = config.enemy_image;

        const enemy=document.getElementById("enemy-img");
        console.log(enemyImage);
        enemy.scr=enemyImage;

    } catch (error) {
        console.error("設定ファイルの読み込みに失敗しました:", error);
        addLog("設定ファイルの読み込みに失敗しました。", 'error');
    }
}
loadConfig();

// GASのウェブアプリURLをここに貼り付け

let enemyStats = { hp: 0, name: "???" };

/**
 * スプレッドシートから最新データを取得
 */
async function syncData() {
    addLog("スプレッドシートと同期中...",'spreadsheet');
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        enemyStats = data;
        addLog(`敵：${enemyStats.name} (HP: ${enemyStats.hp}) を読み込みました。`,'spreadsheet');
    } catch (error) {
        addLog("シートの同期に失敗しました。URLを確認してください。",'error');
        console.error(error);
    }
}

//

/**
 * メッセージログにテキストを追加
 */
function addLog(text,type) {
    const log = document.getElementById('message-log');
    const entry = document.createElement('div');
    
    console.log(type);
    switch(type){
        case 'game':
            entry.classList.add("message-log-game");
            entry.textContent = text;
            break;
        case 'spreadsheet':
            entry.classList.add("message-log-spreadsheet");
            entry.textContent = '📄'+text;
            break;
        case 'error':
            entry.classList.add("message-log-error");
            entry.textContent = '⚠️'+text;
            break;
        case 'gemini':
            entry.classList.add("message-log-gemini");
            entry.textContent = '😎'+text;
            break;
        default:
            entry.classList.add("message-log-game");
            entry.textContent = text;
    }
    log.appendChild(entry);
    
    // 常に最新のメッセージが見えるようにスクロール
    log.scrollTop = log.scrollHeight;
}

/**
 * ログウィンドウに入力欄を追加する関数
 * @param {string} placeholder - 入力欄に表示するヒント
 */
function addInputForm(placeholder = "Geminiに質問する...") {
    const logWindow = document.getElementById('message-log');

    // 1. コンテナの作成
    const container = document.createElement('div');
    container.className = 'log-input-container'; // スタイル調整用
    container.style = "display: flex; gap: 8px; margin-top: 10px; padding: 10px; background: #f0f4f9; border-radius: 8px;";

    // 2. 入力欄の作成
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.style = "flex-grow: 1; border: 1px solid #ccc; border-radius: 4px; padding: 8px;";

    // 3. 送信ボタンの作成
    const button = document.createElement('button');
    button.innerText = "送信";
    button.style = "padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;";

    // 4. 送信イベントの定義
    const handleSubmit = () => {
        const question = input.value;
        if (!question) return;

        // 自分の質問をログに出す
        addLog(`自分: ${question}`);
        
        // 入力欄を消去（または無効化）
        container.remove();

        // Geminiへのリクエスト処理へ（仮）
        askGemini(question);
    };

    button.onclick = handleSubmit;
    input.onkeydown = (e) => { if (e.key === 'Enter') handleSubmit(); };

    // 5. ログウィンドウに追加
    container.appendChild(input);
    container.appendChild(button);
    logWindow.appendChild(container);

    // 自動スクロール
    logWindow.scrollTop = logWindow.scrollHeight;
}
/**
 * コマンド実行
 */
function playTurn(action) {
    switch(action) {
        case 'ATTACK':
            addLog("あなたの攻撃！ 敵に 15 のダメージ！",'game');
            break;
        case 'SKILL':
            addLog("スキル：『火炎斬り』！ 敵に 30 のダメージ！",'game');
            break;
        case 'DEFEND':
            addLog("あなたは身を固めた。 被ダメージを軽減します。",'game');
            break;
    }
}

function thinkingQuestion(){
    addLog("Geminiです！現在の戦況、またはシミュレーションのアイデアをご相談ください！",'gemini');
    addInputForm();
}

/**
 * Gemini AIに助言を求める
 */
async function askAiAction() {
    const hintArea = document.getElementById('ai-hint');
    hintArea.innerText = "考え中...";
    
    // 本来はGAS経由でGemini APIを叩く
    // 今回は簡易的な挙動のみ
    setTimeout(() => {
        hintArea.innerText = "AI: 敵のHPが低くなっています。スキルで一気に畳み掛けましょう！";
    }, 1500);
}

async function askGemini(ques) {
    const queryField = document.getElementById('ai-query');
    const displayArea = document.getElementById('message-log');
    //const userQuery = ques;

    if (!ques) return; // 空なら何もしない

    // 画面上の表示を「考え中」にする
    //displayArea.innerText = "Geminiが思考中...";
    addLog("Geminiが思考中...",'gemini');
    //queryField.value = ""; // 入力欄をクリア

    try {
        // GASへリクエストを飛ばす
        // payloadに 'type: "GEMINI"' などを入れるとGAS側で判定しやすいです
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "ask_gemini",
                prompt: ques,
                // 現在の敵のHPなどの状況も一緒に送ると、AIがより賢い回答をします
                context: `敵の名前:${enemyStats.name}, 残りHP:${enemyStats.hp}`
            })
        });

        const result = await response.json();
        
        // 回答を表示
        //displayArea.innerText = result.answer; 
        addLog(result.answer,'gemini');

    } catch (error) {
        displayArea.innerText = "エラー：AIとの通信に失敗しました。";
        console.error(error);
    }
}