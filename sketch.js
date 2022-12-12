//triangle
//circle
//rectangle


const paitent_count = 300;

function polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a - PI / 2) * radius;
        let sy = y + sin(a - PI / 2) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

var patients = [];
var polyline = [];
var drawing = false;

function is_infected(x, y,m) {
    var ans = y > (1 / 2 - (m * (x - 1 / 2)) ** 3);
    if (random() < 0.04) {
        return !ans;
    }
    return ans;
}

function generate_patient() {
    var r = random() < 0.1 ? 't' : 's';
    var x_score = random();
    var y_score = random();
    // if (r == 't'){
    //     x_score+= random(0,0.02);
    //     y_score+= random(0,0.02);
    // }
    var i = is_infected(x_score, y_score, r == 't'?-1.6:1.6);
    x_score += random(-0.01, 0.01);
    y_score += random(-0.01, 0.01);
    return [r, i, constrain(x_score,0,1), constrain(y_score,0,1)];
}


function reset(){
    patients = [];
    for (var i = 0; i < paitent_count; i++) {
        patients.push(generate_patient());
    }
    analyzeData();
}

function setup() {

    reset();
    var myCanvas = createCanvas(500,500);
    myCanvas.parent("gamediv");
}

function mousePressed() {
    console.log(mouseX);
    if(mouseX < width && mouseX > 0 && mouseY > 0 && mouseY < height){
        drawing = true;
        polyline = [[mouseX, mouseY]];
    }
}

function mouseDragged() {
    if(!drawing){
        return;
    }
    var last_pos = polyline.slice(-1)[0];
    if (dist(last_pos[0], last_pos[1], mouseX, mouseY) > 3) {
        polyline.push([mouseX, mouseY]);
    }
}

function mouseReleased() {
    if (!drawing){
        return;
    }
    drawing = false;
    polyline.push([mouseX, mouseY]);

    if((width-mouseX) < (mouseY)){
        polyline.push([width,mouseY])
    } else {
        polyline.push([mouseX,0])
        polyline.push([width,0])
    }

    polyline.push([width, height])

    var [startX,startY] = polyline[0];

    if((startX) < (height-startY)){
        polyline.push([0, height]);
        polyline.push([0,startY])
    } else {
        polyline.push([startX,height])
    }
    analyzeData();
}

function analyzeData(){
    if(polyline.length == 0){
        return;
    }
    var correct_count = 0
    var correct_triangles = 0;
    var correct_squares = 0;
    var triangle_count = 0;
    var square_count = 0;
    for(const p of patients){
        if(p[0] == 't'){triangle_count++} else {square_count++}
        var predicted_infection = inside([p[2]*width,p[3]*height],polyline);
        var correct_prediction = predicted_infection == p[1];
        if(correct_prediction){
            correct_count+=1;
            if(p[0] == 't'){correct_triangles++} else {correct_squares++}
        }
    }
    var overall = correct_count/patients.length;
    var tri_acc = correct_triangles/triangle_count
    var sq_acc =  correct_squares/square_count;
    overall = Math.round(overall*1000)/10;
    tri_acc = Math.round(tri_acc*1000)/10;
    sq_acc = Math.round(sq_acc*1000)/10;
    var d = `Overall accuracy: ${overall}% <br> Triangle accuracy: ${tri_acc}% <br> Square accuracy: ${sq_acc}%`
    document.getElementById("output").innerHTML = d;
}


function draw() {
    background(220);
    fill(120,120,120)
    if (drawing) {
        for (var i = 0; i < polyline.length - 1; i++) {
            line(...polyline[i], ...polyline[i + 1]);
        }
    } else if (polyline.length > 1) {
        beginShape();
        for (var v of polyline) {
            vertex(...v);
        }
        endShape(CLOSE);
    }
    for (var data of patients) {
        var n = data[0] === 't' ? 3 : 4;
        if (data[1]) {
            fill(255, 0, 0);
        } else {
            fill(0, 255, 0);
        }
        polygon(data[2] * width, data[3] * height, 5, n);
    }
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}