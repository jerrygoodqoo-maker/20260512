let video;
let noCamera = false;
let errorMsg = '';
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImgs = [];
let currentEarringIndex = 0;

function preload() {
  // 預載入五種耳環圖片
  for (let i = 1; i <= 5; i++) {
    earringImgs.push(loadImage(`pic/acc/acc${i}_ring.png`)); // 假設命名規則，依需求修正
  }
  // 根據要求更正特定的檔名路徑
  earringImgs[0] = loadImage('pic/acc/acc1_ring.png');
  earringImgs[1] = loadImage('pic/acc/acc2_pearl.png');
  earringImgs[2] = loadImage('pic/acc/acc3_tassel.png');
  earringImgs[3] = loadImage('pic/acc/acc4_jade.png');
  earringImgs[4] = loadImage('pic/acc/acc5_phoenix.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 指定前鏡頭（手機預設可能是後鏡頭）
  video = createCapture({ video: { facingMode: 'user' } }, onVideoReady);
  video.elt.addEventListener('error', () => {
    noCamera = true;
    errorMsg = '無法開啟攝影機';
  });
  video.hide();
}

function onVideoReady() {
  // 初始化 FaceMesh
  faceMesh = ml5.faceMesh({ maxFaces: 1 }, () => {
    faceMesh.detectStart(video, gotFaces);
  });

  // 初始化 HandPose
  handPose = ml5.handPose({ maxHands: 1, flipped: true }, () => {
    handPose.detectStart(video, gotHands);
  });
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
  if (hands.length > 0) {
    let num = countFingers(hands[0]);
    if (num >= 1 && num <= 5) {
      currentEarringIndex = num - 1;
    }
  }
}

function countFingers(hand) {
  let count = 0;
  // 偵測食指、中指、無名指、小指 (依據指尖與第二指節的高度差)
  if (hand.keypoints[8].y < hand.keypoints[6].y) count++;
  if (hand.keypoints[12].y < hand.keypoints[10].y) count++;
  if (hand.keypoints[16].y < hand.keypoints[14].y) count++;
  if (hand.keypoints[20].y < hand.keypoints[18].y) count++;
  
  // 偵測大拇指 (依據與手掌橫向距離)
  let thumbTip = hand.keypoints[4];
  let thumbBase = hand.keypoints[17];
  if (dist(thumbTip.x, thumbTip.y, thumbBase.x, thumbBase.y) > 60) count++;
  
  return count;
}

function draw() {
  background('#e7c6ff');

  if (noCamera) {
    fill(80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text(errorMsg, width / 2, height / 2);
    return;
  }

  if (!video) return;

  // 使用實際影像解析度做座標映射
  let vw = video.elt.videoWidth || video.width;
  let vh = video.elt.videoHeight || video.height;

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, width * 0.5, height * 0.5);

  if (faces.length > 0 && vw > 0) {
    // 177 右耳垂，401 左耳垂
    let lobeIndices = [177, 401];
    for (let i = 0; i < lobeIndices.length; i++) {
      let ear = faces[0].keypoints[lobeIndices[i]];
      if (!ear) continue;

      let x = map(ear.x, 0, vw, -width * 0.25, width * 0.25);
      let y = map(ear.y, 0, vh, -height * 0.25, height * 0.25);

      let imgW = width * 0.04;
      let imgH = imgW * 1.5;

      // 計算往外往上的位移比率
      // x 軸：正值代表左耳方向(畫面右側)，負值代表右耳方向。往外就是讓絕對值變大。
      let offsetX = (x > 0) ? imgW * 0.2 : -imgW * 0.2;
      let offsetY = -imgH * 0.2; // 往上移動

      // 繪製目前手勢選中的耳環
      image(earringImgs[currentEarringIndex], x + offsetX, y + offsetY + 25, imgW, imgH);
    }
  }
  pop();

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(32);
  text("414730399 朱俊圻", width / 2, 30);
  textSize(24);
  text("作品為影像辨識_耳環臉譜", width / 2, 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}