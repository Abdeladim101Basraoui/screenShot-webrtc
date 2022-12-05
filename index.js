(() => {
  //
  const width = 320;
  let hight = 0;

  let streaming = false;

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  //
  function showViewResultButton() {
    if (window.self !== window.top) {
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = document.body.append(button);

      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }
  //
  function startUp() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startButton = document.getElementById("startButton");

    //get mediastream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.log(`get the stream error ${err}`);
      });

    video.addEventListener(
      "canplay",
      function (ev) {
        if (!streaming) {
          hight = video.videoHeight / (video.videoWidth / width);
          if (isNaN(hight)) {
            hight = width / (4 / 3);
          }
          video.setAttribute("width", width);
          video.setAttribute("height", hight);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", hight);
          streaming = true;
        }
      },
      false
    );

    startButton.addEventListener(
      "click",
      (ev) => {
        takePicture();
        ev.preventDefault();
      },
      false
    );

    clearPhoto();
  }

  function clearPhoto() {
    const context = canvas.getContext("2d");

    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  function takePicture() {
    const context = canvas.getContext("2d");
    if (width && hight) {
      canvas.width = width;
      canvas.height = hight;
      context.drawImage(video, 0, 0, width, hight);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearPhoto();
    }
  }

  window.addEventListener("load", startUp, false);
})();
