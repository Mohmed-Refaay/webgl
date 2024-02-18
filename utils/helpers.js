
/**
 * @param {WebGLRenderingContext} gl 
 */
export function createShader(gl, shaderSource, shaderType) {
    /** @type {WebGLShader}  */
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);


    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const compileError = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);

        throw(compileError);
    }

    return shader;
}

/**
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLShader}  vertexShader
 * @param {WebGLShader}  fragmentShader
 */
export function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const linkError = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(linkError);
    }
    
    return program;
}
   
    