let capture;
let faceMesh;
let faces = [];

function setup() {
  // 1. 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 設定擷取影像的顯示大小為畫布寬高的 50%
  capture.size(windowWidth * 0.5, windowHeight * 0.5);
  // 隱藏預設產生的 DOM 影片元件，只在畫布上繪製
  capture.hide();

  // 載入 faceMesh 模型
  faceMesh = ml5.faceMesh(capture, () => {
    console.log("模型準備就緒！");
  });
  // 開始持續偵測臉部
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });
}

function draw() {
  // 3. 設定背景顏色為 #e7c6ff
  background('#e7c6ff');

  // 在畫布上方置中顯示文字
  fill(0); // 設定文字顏色為黑色
  textSize(24); // 設定字體大小
  textAlign(CENTER, TOP);
  text("414730399朱俊圻", width / 2, 20);
  text("作品為影像辨識_耳環臉譜", width / 2, 55);

  // 4. 處理影像置中與左右顛倒
  push();
  // 將原點移至畫布中心
  translate(width / 2, height / 2);
  // 水平翻轉（左右顛倒）
  scale(-1, 1);
  
  // 繪製影像，影像寬高為畫布寬高的 50%
  imageMode(CENTER);
  image(capture, 0, 0, width * 0.5, height * 0.5);

  // 5. 辨識耳垂並畫出耳環
  if (faces.length > 0) {
    let face = faces[0];
    // MediaPipe FaceMesh 中，索引 150 約為左耳垂，379 約為右耳垂
    let leftEarlobe = face.keypoints[150];
    let rightEarlobe = face.keypoints[379];

    drawEarring(leftEarlobe);
    drawEarring(rightEarlobe);
  }
  pop();
}

/**
 * 在指定位置向下畫出三個黃色圓圈（耳環樣子）
 */
function drawEarring(point) {
  if (!point) return;
  
  // 將座標轉換為以畫布中心為原點的相對座標
  let x = point.x - capture.width / 2;
  let y = point.y - capture.height / 2;

  fill('#ffff00'); // 黃色
  noStroke();
  for (let i = 1; i <= 3; i++) {
    // 每個圓圈向下偏移
    circle(x, y + (i * 12), 10);
  }
}

function windowResized() {
  // 當視窗縮放時，同步更新畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
