import { setup, createActor, fromPromise, assign } from "xstate";

const FURHATURI = "127.0.0.1:54321";

async function fhVoice(name: string) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  const encName = encodeURIComponent(name);
  return fetch(`http://${FURHATURI}/furhat/voice?name=${encName}`, {
    method: "POST",
    headers: myHeaders,
    body: "",
  });
}

async function fhSay(text: string) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  const encText = encodeURIComponent(text);
  return fetch(`http://${FURHATURI}/furhat/say?text=${encText}&blocking=true`, {
    method: "POST",
    headers: myHeaders,
    body: "",
  });
}

//Gesture 1
async function ShakeHeadGesture() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/gesture?blocking=true`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      name: "ShakeHeadGesture",
      frames: [
        {
          time: [0.1,0.5,0.8], //ADD THE TIME FRAME OF YOUR LIKING
          persist: true,
          params: {
            "NECK_PAN": -50.0,
            //ADD PARAMETERS HERE IN ORDER TO CREATE A GESTURE
          },
        },
        {
          time: [1.0], //ADD TIME FRAME IN WHICH YOUR GESTURE RESETS
          persist: true,
          params: {
          reset: true,
          },
        },
        //ADD MORE TIME FRAMES IF YOUR GESTURE REQUIRES THEM
        {
          time: [1.1,1.5,2], 
          persist: true,
          params: {
            "NECK_PAN": 50.0,
          },
        },
                {
          time: [2.5],
          persist: true,
          params: {
          reset: true,
          },
        },
      ],
      class: "furhatos.gestures.Gesture",
    }),
  });
}

//Gesture 2
async function EyeGesture() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/gesture?blocking=true`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      name: "EyeGesture",
      frames: [
        {
          time: [0.1,0.5,0.8], 
          persist: true,
          params: {
            "LOOK_LEFT": 1,
          },
        },
        {
          time: [1.0], 
          persist: true,
          params: {
          reset: true,
          },
        },
        {
          time: [1.1,1.5,2], 
          persist: true,
          params: {
            "LOOK_RIGHT": 1,
          },
        },
                {
          time: [2.5],
          persist: true,
          params: {
          reset: true,
          },
        },
      ],
      class: "furhatos.gestures.Gesture",
    }),
  });
}

//Gesture 3 with audio
async function WhisperGesture() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/gesture?blocking=true`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      name: "MouthGesture",
      frames: [
        {
          time: [0.5], 
          persist: true,
          params: {
            "PHONE_AAH": 1,
            "PHONE_B_M_P": 0,
            "NECK_ROLL": 25,
            "NECK_PAN": -25,
            "NECK_TILT": 5
          },
        },
        {
          time: [15.5], 
          persist: true,
          params: {
          reset: true,
          },
        },
        {
          time: [16], 
          persist: true,
          params: {
            "PHONE_AAH": 0,
            "PHONE_B_M_P": 1,
            "NECK_ROLL": -25,
            "NECK_PAN": 25,
            "NECK_TILT": -5
          },
        },
        {
          time: [28],
          persist: true,
          params: {
          reset: true,
          },
        },
      ],
      class: "furhatos.gestures.Gesture",
    }),
  });
}


async function fhAttendClosestUser() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/attend?user=CLOSEST`, {
    method: "POST",
    headers: myHeaders,
    body: "", 
  });
}

async function fhGesture(text: string) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(
    `http://${FURHATURI}/furhat/gesture?name=${text}&blocking=true`,
    {
      method: "POST",
      headers: myHeaders,
      body: "",
    },
  );
}

async function SpeakWithShake(text: string) {
  return Promise.all([
    fhSay(text),           
    ShakeHeadGesture(),    
  ]);
}

async function SpeakWithEye(text: string) {
  return Promise.all([
    fhSay(text),
    EyeGesture(),
  ]);
}

async function fhAudio() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(
    `http://${FURHATURI}/furhat/say?url=${encodeURIComponent(
      "https://raw.githubusercontent.com/destinywillso/xstate-furhat-starter/master/src/whisper-voices-1-193087.wav"
    )}&blocking=true&speech=false`, 
    {
      method: "POST",
      headers: myHeaders,
    }
  );
}

async function fhWhisperWithAudio() {
  await Promise.all([
    WhisperGesture(),  
    fhAudio(),         
  ]);
}


async function fhListen() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/listen`, {
    method: "GET",
    headers: myHeaders,
  })
    .then((response) => response.body)
    .then((body) => body.getReader().read())
    .then((reader) => reader.value)
    .then((value) => JSON.parse(new TextDecoder().decode(value)).message);
}

const dmMachine = setup({
  actors: {
    fhVoice: fromPromise<any, null>(async () => {
      return fhVoice("en-US-EchoMultilingualNeural");
    }),
    fhHello: fromPromise<any, null>(async () => {
      return fhSay("Hi");
    }),
    fhL: fromPromise<any, null>(async () => {
      return fhListen();
   }),
    fhAttendClosestUser: fromPromise<any, null>(async () => {
      return fhAttendClosestUser();
   }),
    fhShakeHead1: fromPromise<any, null>(async () => {
      return ShakeHeadGesture();
   }),
    fhEye: fromPromise<any, null>(async () => {
      return EyeGesture();
   }),
   fhWhisper: fromPromise<any, null>(async () => {
      return fhWhisperWithAudio();
}),
  }
}).createMachine({
  id: "root",
  initial: "Start",
  states: {
    Start: { after: { 1000: "Next" } },
    Next: {
      invoke: {
        src: "fhHello",      
        input: null,
        onDone: {
          target: "GetClosestUser",
          actions: async({ event }) => console.log(event.output),
        },
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      },
    },
    GetClosestUser:{
      invoke:{
        src: "fhAttendClosestUser",
        input: null,
        onDone: {
          target: "ShakeHeadGesture1",
          actions: ({ event }) => console.log(event.output),
        },
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      },
    },

    ShakeHeadGesture1:{
      invoke:{
        src: fromPromise(async () => SpeakWithShake("I am shaking my head now")),
        input: null,
        onDone: {
          target: "EyeGesture",
          action: ({ event }) => console.log(event.output),
        },
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      },
    },

    EyeGesture:{
      invoke:{
        src: fromPromise(async () => SpeakWithEye("Look at my eyes")),
        input: null,
        onDone: {
          target: "Whisper",
          action: ({ event }) => console.log(event.output),
        },
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      },
    },

    Whisper:{
      invoke:{
        src: "fhWhisper",
        input: null,
        onDone: {
          target: "Done",
          action: ({ event }) => console.log(event.output),
        },
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      },
    },
    Done:{
      type: "final"
    },
    Fail:{
      type: "final"
    }
  },
});

const actor = createActor(dmMachine).start();
console.log(actor.getSnapshot().value);

actor.subscribe((snapshot) => {
  console.log(snapshot.value);
});

//yarn tsx src/main.ts