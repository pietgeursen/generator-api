const path = require('path');
const spawn = require('child_process').spawn;
const mkdirp = require('mkdirp');

const expect = require('chai').expect

const binPath = path.resolve(__dirname, '../../bin/node_api_generator');
const tempDir = path.resolve(__dirname, '../../temp');

const run = (dir, args, callback) => {
  const argv = [binPath].concat(args);
  const exec = process.argv[0];
  let stderr = '';
  let stdout = '';

  const child = spawn(exec, argv, {
    cwd: dir
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function ondata(str) {
    stdout += str;
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function ondata(str) {
    process.stderr.write(str);
    stderr += str;
  });

  child.on('close', onclose);
  child.on('error', callback);

  function onclose(code) {
    const err = null;

    try {
      // expect(stderr).to.deep.equal('')
      // assert.equal(stderr, '');
      expect(code).to.equal(0)
      // assert.strictEqual(code, 0);
    } catch (e) {
      err = e;
    }

    callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
  }
}

const createEnvironment = (callback) => {
  var num = process.pid + Math.random();
  var dir = path.join(tempDir, ('app-' + num));

  mkdirp(dir, function ondir(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

module.exports = { run, path, createEnvironment, tempDir }