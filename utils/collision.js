// rectangle

export function isIntersecting(x,y,x1,y1,x2,y2,shape){

    
    switch(shape){
        case "line":

            

            break;
        case "rectangle":
            let maxX = Math.max(x1,x2)
            let minX = Math.min(x1,x2)
            let maxY = Math.max(y1,y2)
            let minY = Math.min(y1,y2)

            if(x < maxX && x > minX && y < maxY && y > minY){
                return {collision:true,shape:"rectangle"}
            }
            break;
        case "ellipse":
            let h = x1 + ((x2-x1)/2) , 
                k = y1 + ((y2-y1)/2) , 
                a = Math.abs(x2-x1)/2 , 
                b = Math.abs(y2-y1)/2 ;

                let status = (Math.pow((x - h), 2) / Math.pow(a, 2))
                + (Math.pow((y - k), 2) / Math.pow(b, 2));

                if(status <= 1){
                    return {collision:true,shape:"ellipse"}
                }
            break;

    }

    
    
    // ellipse

    

    
    return {collision:false,shape:null}
     

    // line



}