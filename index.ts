let years: string[] = [
  "2000",
  "2001",
  "2002",
  "2003",
  "2004",
  "2005",
  "2006",
  "2007",
  "2008",
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
];

type ChosenPiece = {
  arc: number,
  year: string
}

let chosenPieces:ChosenPiece[] = []

let loadedImages: boolean[] = [];

const degToRad = (angle: number) => {
  angle = angle % 360;
  angle = angle < 0 ? 360 + angle : angle;
  return (angle * Math.PI) / 180;
};

const radToDeg = (angle: number) => {
  return (angle * 180) / Math.PI;
};

let arc = degToRad(360 / years.length);

let value: number = -90 - radToDeg(arc);

const center = 400

window.addEventListener("load", async () => {
  shuffle(years);
  await new Promise<HTMLImageElement[]>((resolve) => {
    years.forEach((year, index) => {
      let image = new Image();
      image.onload = function () {
        image.id = year;
        images.push(image);
        if (images.length === years.length) {
          resolve(images);
        }
      };
      image.src = `./${year}.jpg`;
    });
  });
  canvas = document.getElementById(
    "gl"
  ) as HTMLCanvasElement;
  context = canvas.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  
  canvas2 = document.getElementById(
    "gl2"
  ) as HTMLCanvasElement;
  context2 = canvas2.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  canvas2.setAttribute(
    "style",
    `transform: rotate(${-90 - radToDeg(arc / 2)}deg)`
  );  
  drawCanvas();
  document.getElementsByTagName("button")[0].onclick = (event: MouseEvent) =>
    clickSpin(event);
});

const calcPointOnCircle = (
  radius: number,
  index: number,
  centralAngle: number,
  centerX: number = 400,
  centerY: number = 400,
  additionalAngle: number = 0
) => {
  let centralAngleRad: number = (centralAngle / 180) * Math.PI;
  let additionalAngleRad: number = (additionalAngle / 180) * Math.PI;
  let targetAngle: number = index * centralAngleRad + additionalAngleRad;
  targetAngle =
    targetAngle > Math.PI * 2 ? targetAngle - Math.PI * 2 : targetAngle;
  const x: number = radius * Math.cos(targetAngle) + centerX;
  const y: number = radius * Math.sin(targetAngle) + centerY;
  return [x, y];
};

const clickSpin = (event: MouseEvent) => {
  let centralAngle = 360 / years.length;
  event.preventDefault();
  let wheel = document.getElementById("wheel") as HTMLDivElement;
  let additionalAngle = Math.floor(Math.random() * 360) + 1;
  let numberOfTurns = Math.floor(Math.random() * 6) + 1;
  value += 360 * numberOfTurns + additionalAngle;
  let targetAngle: number = value % 360;
  let field = Math.round(targetAngle / centralAngle);
  if (field >= years.length) {
    field = field % years.length;
  }
  let selectedYear = years[field];
  wheel.setAttribute("style", `transform: rotate(-${value}deg);`);
  let interval: NodeJS.Timer | null = null;
  let count = 0;
  setTimeout(() => {
    document.getElementById("year")!.innerHTML = years[field];
    drawCanvas(true)
    interval = setInterval(() => {
      if (count < 29) {
        count += 1;
        drawSector(
          years[field],
          context2.createPattern(
            images.find((img) => img.id === years[field])!,
            "repeat"
          )!,
          field,
          300,
          count,
          context2
        );
      }
    }, 100);
  }, 2000);
  interval = null;
  setTimeout(() => {
    chosenPieces.push({
      arc: arc,
      year: selectedYear
    })
    makeChosenPieces()
    years = years.filter((year) => year !== selectedYear);
    document.getElementById("year")!.innerHTML = "";
    canvas2.width = 800
    drawCanvas();
  }, 5000);
};

let canvas: HTMLCanvasElement
let context: CanvasRenderingContext2D
let canvas2: HTMLCanvasElement
let context2: CanvasRenderingContext2D

function shuffle(arr: any[]) {
  var i = arr.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

const images: HTMLImageElement[] = [];

const drawCanvas = async (opac:boolean = false) => {
  arc = degToRad(360 / years.length);
  canvas.width = 800;
  canvas.height = 800;
  const centerX: number = canvas.width / 2;
  const centerY: number = canvas.height / 2;
  const radius: number = 300;
  if(opac){
    context.globalAlpha = 0.2
  }
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = "#eee";
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = "#000";
  context.stroke();
  canvas.setAttribute(
    "style",
    `transform: rotate(${-90 - radToDeg(arc / 2)}deg)`
  );
  years.forEach((year, index) => {
    drawSector(
      year,
      context.createPattern(images.find((img) => img.id === year)!, "repeat")!,
      index,
      radius
    );
  });
};

const drawSector = (
  year: string,
  image: CanvasPattern,
  index: number,
  rad: number,
  offset?:number,
  localContext:CanvasRenderingContext2D = context as CanvasRenderingContext2D,
  localCenterX:number = center,
  localCenterY:number = center,
  arcOffset:number = 0,
  localArc:number = arc
) => {
  const ang = localArc * index;
  localContext.save();
  // COLOR
  localContext.beginPath();
  localContext.moveTo(localCenterX, localCenterY);
  localContext.arc(localCenterX, localCenterY, rad + 2 * (offset ?? 0), ang - degToRad((offset??0)/2) + arcOffset, ang + localArc + degToRad((offset??0)/2)+arcOffset);
  localContext.lineTo(localCenterX, localCenterY);
  localContext.fillStyle = image;
  localContext.fill();
  // TEXT
  localContext.translate(localCenterX, localCenterY);
  localContext.rotate(ang + localArc / 2);
  localContext.textAlign = "right";
  localContext.font = "bold 35px Fredoka";
  localContext.fillStyle = "#000";
  localContext.fillText(year, rad - 5, 15);
  localContext.fillStyle = "#fff";
  localContext.font = "bold 30px Fredoka";
  localContext.fillText(year, rad - 10, 10);
  //
  localContext.restore();
};

const makeChosenPieces = () => {
  let wrapper = document.getElementById('chosen') as HTMLDivElement
  wrapper.innerHTML = "";
  chosenPieces.forEach(piece=>{
    let newCanvas = document.createElement('canvas')
    newCanvas.width = 300
    newCanvas.height = 120
    let newContext = newCanvas.getContext('2d')
    drawSector(piece.year,newContext?.createPattern(images.find(img=>img?.id === piece.year)!,'no-repeat')!, 0, 200, 0, newContext!, 250, 60, degToRad(180-(radToDeg(piece.arc) / 2)), piece.arc)
    let newSpan = document.createElement('span')
    newSpan.innerHTML = piece.year
    let newDiv = document.createElement('div')
    newDiv.appendChild(newCanvas)
    newDiv.appendChild(newSpan)
    wrapper.appendChild(newDiv)
  })
}