let GAS_URL = null;
//let enemyImage = null;

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
        //enemyImage = config.enemy_image;

        const enemy=document.getElementById("enemy-img");
        //console.log(enemyImage);
        enemy.scr=config.enemy_image;

    } catch (error) {
        console.error("設定ファイルの読み込みに失敗しました:", error);
        addLog("設定ファイルの読み込みに失敗しました。", 'error');
    }
}
loadConfig();
//console.log(config.enemyImage);

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
function addInputForm(placeholder = "どうする？") {
    const logWindow = document.getElementById('message-log');

    const container = document.createElement('div');
    container.className = 'log-input-container'; // 上記CSSを適用

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'log-input-field';
    input.placeholder = placeholder;

    const button = document.createElement('button');
    button.className = 'log-input-button';
    button.innerText = "実行";

    // 送信後の処理
    const handleSubmit = () => {
        const text = input.value;
        if (!text) return;
        
        // 入力欄を消して、入力した内容をログに残す
        container.remove();
        addLog(`▶ ${text}`); 
        
        // ここでGemini APIなどを叩く
        askGemini(text); 
    };

    button.onclick = handleSubmit;
    input.onkeydown = (e) => { if (e.key === 'Enter') handleSubmit(); };

    container.appendChild(input);
    container.appendChild(button);
    logWindow.appendChild(container);
    
    // 登場と同時にフォーカスを当てる
    setTimeout(() => input.focus(), 10);
    
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

    console.log("Geminiへのリクエスト開始:", prompt); // これがコンソールに出るか確認
    /*setTimeout(() => {
        addLog("Gemini: 私はあなたの質問「" + ques + "」を受け取りました。",'gemini');
    }, 1000);*/
    //console.log(config.GEMINI_API_KEY);
    try {
        // 1. JSONファイルからAPIキーを読み込む
        const configResponse = await fetch('./non-share.json');
        const config = await configResponse.json();
        const API_KEY = config.GEMINI_API_KEY;
        //console.log(API_KEY);

        const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

        // 2. Geminiに送るデータ（リクエストボディ）の作成
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: ques }]
                }]
            })
        };

        // 3. 通信実行
        //console.log("送信先URL:", URL);
        const response = await fetch(URL, requestOptions);
        const data = await response.json();

        // 4. 返答の抽出と表示
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const answer = data.candidates[0].content.parts[0].text;
            addLog(`Gemini: ${answer}`,'gemini');
        } else {
            addLog("Gemini: すまない！分からなかった！もう一度質問よろちゃん！",'gemini');
            console.error("Unexpected response:", data);
        }

        /*const response = await fetch(config.GAS_url, {
            method: "POST",
            body: JSON.stringify({
                action: "ask_gemini",
                prompt: ques,
                // 現在の敵のHPなどの状況も一緒に送ると、AIがより賢い回答をします
                context: `敵の名前:${enemyStats.name}, 残りHP:${enemyStats.hp}`
            })
        });*/

        //const result = await response.json();
        
        // 回答を表示
        //displayArea.innerText = result.answer; 
        //addLog(result.answer,'gemini');

    } catch (error) {
        //displayArea.innerText = "エラー：AIとの通信に失敗しました。";
        addLog("システム: 通信エラーが発生しました。コンソールを確認してください。",'error');
        console.error("Error calling Gemini API:", error);
    }
}