import rough from "roughjs";
const generator = rough.generator();

const generateElement = (x1, y1, x2, y2, tool) => {

  let shape;

  switch (tool) {
    case "line":
        shape = generator.line(x1, y1, x2, y2);
      break;
    case "rectangle":
        shape = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;
    case "circle":
        shape = generator.circle(
        x1,
        y1,
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      );
      break;
    default:
      break;
  }
  return { x1, y1, x2, y2, shape};
};


class Shape{
    constructor(x1,y1,x2,y2,type){
        this.type = type
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.isSelected = false
        this.element = generateElement(this.x1, this.y1, this.x2, this.y2, type)
    }
}

export default Shape