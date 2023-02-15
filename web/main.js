import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

(() => {
  // const width = 320; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream
  let width;
  let streaming = false;

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  const getMediaDevice = async () => {
    return await navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        return stream;
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
  };

  async function startup() {
    if (showViewLiveResultButton()) {
      return;
    }
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");
    const videoStream = await getMediaDevice();
    console.log("videoStream", videoStream);
    const trackSettings = videoStream.getVideoTracks()[0].getSettings();
    const cameraCapabilities = videoStream
      .getVideoTracks()[0]
      .getCapabilities();
    console.table([
      {
        height: trackSettings.height,
        width: trackSettings.width,
        aspectRatio: trackSettings.aspectRatio,
        frameRate: trackSettings.frameRate,
        facingMode: trackSettings.facingMode,
        resizeMode: trackSettings.resizeMode,
        deviceId: trackSettings.deviceId,
        groupId: trackSettings.groupId,
      },
    ]);
    console.log("cameraCapabilities", cameraCapabilities);

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          width = cameraCapabilities.width.max;
          height =
            cameraCapabilities.height.max /
            (cameraCapabilities.width.max / width);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.

          if (isNaN(height)) {
            cameraCapabilities.width.max = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
        console.log("videoProperties");
        console.table([
          { "video.videoHeight": video.videoHeight },
          { "video.videoWidth": video.videoWidth },
        ]);
      },
      false
    );

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  async function takepicture(drawCanva) {
    let file;
    let newCanva, newContext;
    // const context = canvas.getContext("2d");
    if (drawCanva === undefined) {
      newCanva = document.createElement("canvas");
      newContext = newCanva.getContext("2d");
    } else 
    {
      newCanva = canvas;
      newContext = newCanva.getContext("2d");
    }
    if (width && height) {
      newCanva.width = width;
      newCanva.height = height;
      newContext.drawImage(video, 0, 0, width, height);

      const data = newCanva.toDataURL("image/png");

      newCanva.toBlob((blob) => {
        file = new File([blob], "fileName.jpg", { type: "image/jpeg" });
      
        console.log("FILE blob", file);

        console.log("file socket", file);
        socket.emit("theImage", { client: socket.id, data: file });

        // return file;
      }, "image/jpeg");
    } else {
      clearphoto();
    }
  }
  window.addEventListener("load", startup, false);

  const socket = io("http://localhost:3000/shot");
  socket.on("connect", () => {
    console.log("connected");
  });

  const sendBtn = document.getElementById("sendBtn");

  //cote medecin
  sendBtn.addEventListener("click", () => {
    socket.emit("screenShot", { client: socket.id });
  });

  socket.on("screenShot", (data) => {
    const img = document.getElementById("img");
    img.src = data;
  });

  //cote infermier
  socket.on("takeScreenShot", async () => {
    takepicture();
  });

  socket.on("receiveImage", (data) => {
    console.log("data", data);
    const blob = new Blob([data.data], { type: "image/jpeg" });
    //file to base64
    // const photo = document.getElementById("photo");
   takepicture(data.data);

  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
})();
