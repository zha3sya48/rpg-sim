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
        default:
            entry.classList.add("message-log-game");
            entry.textContent = text;
    }
    log.appendChild(entry);
    
    // 常に最新のメッセージが見えるようにスクロール
    log.scrollTop = log.scrollHeight;
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