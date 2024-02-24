import "./style.css";
import { createProgram, createShader } from "./utils/helpers.js";

import * as dat from "dat.gui";
import { m4 } from "./utils/math";

const data = {
  x: 0,
  y: 0,
  z: -400,
  sx: 1,
  sy: 1,
  sz: 1,
  angleX: 0,
  angleY: 0,
  angleZ: 0,
};

const gui = new dat.GUI();

gui.add(data, "x", -1000, 1000, 1);
gui.add(data, "y", -1000, 1000, 1);
gui.add(data, "z", -1000, 0, 1);

gui.add(data, "sx", -20, 20, 0.1);
gui.add(data, "sy", -20, 20, 0.1);
gui.add(data, "sz", -20, 20, 0.1);

gui.add(data, "angleX", -Math.PI, Math.PI, 0.1);
gui.add(data, "angleY", -Math.PI, Math.PI, 0.1);
gui.add(data, "angleZ", -Math.PI, Math.PI, 0.1);

function main() {
  const canvas = document.getElementById("demo-canvas");
  if (!canvas) {
    return;
  }

  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  const vertexShader = createShader(
    gl,
    `
        attribute vec4 a_position;
        attribute vec3 a_color;
        uniform mat4 u_matrix;

        varying vec3 v_color;

        void main() {
          v_color = a_color;
          gl_Position = u_matrix * a_position;
        }
    `,
    gl.VERTEX_SHADER,
  );

  const fragmentShader = createShader(
    gl,
    `precision mediump float;
        uniform vec3 u_color;
        varying vec3 v_color;

        void main() {
            gl_FragColor = vec4(v_color, .2);
        }
    `,
    gl.FRAGMENT_SHADER,
  );

  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttribLocation = gl.getAttribLocation(
    program,
    "a_position",
  );

  const colorAttribLocation = gl.getAttribLocation(
    program,
    "a_color",
  );

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColor(gl);

  draw();

  function draw() {
    data.angleY += 0.01;
    requestAnimationFrame(draw);
    let matrix = m4.perspective(
      45,
      gl.canvas.width / gl.canvas.height,
      1,
      1000,
    );
    matrix = m4.multiply(
      matrix,
      // prettier-ignore
      [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 1, 1, 1
      ],
    );
    matrix = m4.translate(matrix, data.x, data.y, data.z);
    matrix = m4.xRotate(matrix, data.angleX);
    matrix = m4.yRotate(matrix, data.angleY);
    matrix = m4.zRotate(matrix, data.angleZ);
    matrix = m4.scale(matrix, data.sx, data.sy, data.sz);
    matrix = m4.translate(matrix, -50, -75, 0);

    const matrixUniformLocation = gl.getUniformLocation(
      program,
      "u_matrix",
    );

    // resize canvas
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // tell webgl where is the clip space
    gl.viewport(0, 0, canvas.width, canvas.height);

    // clear canvas
    gl.clearColor(0, 0.1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
      colorAttribLocation,
      3,
      gl.UNSIGNED_BYTE,
      true,
      0,
      0,
    );

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  }
}

function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      // left column front
      0,   0,  0,
      0, 150,  0,
      30,   0,  0,
      0, 150,  0,
      30, 150,  0,
      30,   0,  0,

      // top rung front
      30,   0,  0,
      30,  30,  0,
      100,   0,  0,
      30,  30,  0,
      100,  30,  0,
      100,   0,  0,

      // middle rung front
      30,  60,  0,
      30,  90,  0,
      67,  60,  0,
      30,  90,  0,
      67,  90,  0,
      67,  60,  0,

      // left column back
        0,   0,  30,
       30,   0,  30,
        0, 150,  30,
        0, 150,  30,
       30,   0,  30,
       30, 150,  30,

      // top rung back
       30,   0,  30,
      100,   0,  30,
       30,  30,  30,
       30,  30,  30,
      100,   0,  30,
      100,  30,  30,

      // middle rung back
       30,  60,  30,
       67,  60,  30,
       30,  90,  30,
       30,  90,  30,
       67,  60,  30,
       67,  90,  30,

      // top
        0,   0,   0,
      100,   0,   0,
      100,   0,  30,
        0,   0,   0,
      100,   0,  30,
        0,   0,  30,

      // top rung right
      100,   0,   0,
      100,  30,   0,
      100,  30,  30,
      100,   0,   0,
      100,  30,  30,
      100,   0,  30,

      // under top rung
      30,   30,   0,
      30,   30,  30,
      100,  30,  30,
      30,   30,   0,
      100,  30,  30,
      100,  30,   0,

      // between top rung and middle
      30,   30,   0,
      30,   60,  30,
      30,   30,  30,
      30,   30,   0,
      30,   60,   0,
      30,   60,  30,

      // top of middle rung
      30,   60,   0,
      67,   60,  30,
      30,   60,  30,
      30,   60,   0,
      67,   60,   0,
      67,   60,  30,

      // right of middle rung
      67,   60,   0,
      67,   90,  30,
      67,   60,  30,
      67,   60,   0,
      67,   90,   0,
      67,   90,  30,

      // bottom of middle rung.
      30,   90,   0,
      30,   90,  30,
      67,   90,  30,
      30,   90,   0,
      67,   90,  30,
      67,   90,   0,

      // right of bottom
      30,   90,   0,
      30,  150,  30,
      30,   90,  30,
      30,   90,   0,
      30,  150,   0,
      30,  150,  30,

      // bottom
      0,   150,   0,
      0,   150,  30,
      30,  150,  30,
      0,   150,   0,
      30,  150,  30,
      30,  150,   0,

      // left side
      0,   0,   0,
      0,   0,  30,
      0, 150,  30,
      0,   0,   0,
      0, 150,  30,
      0, 150,   0]),
    gl.STATIC_DRAW,
  );
}

function setColor(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Uint8Array([
      // left column front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

      // top rung front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

      // middle rung front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

      // left column back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

      // top rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

      // middle rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

      // top
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,

      // top rung right
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,

      // under top rung
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,

      // between top rung and middle
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,

      // top of middle rung
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,

      // right of middle rung
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,

      // bottom of middle rung.
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,

      // right of bottom
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,

      // bottom
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,

      // left side
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220]),
    gl.STATIC_DRAW,
  );
}
try {
  main();
  console.log("Runs!");
} catch (e) {
  console.log(e);
}
