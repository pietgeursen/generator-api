
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
// var mkdirp = require('mkdirp');
var mocha = require('mocha');
// var path = require('path');
var request = require('supertest');
var rimraf = require('rimraf');
// var spawn = require('child_process').spawn;

const expect = require('chai').expect
const { run, path, createEnvironment, tempDir } = require('./helpers')

// var binPath = path.resolve(__dirname, '../bin/node_api_generator');
// var tempDir = path.resolve(__dirname, '../temp');

describe('express(1)', function () {
  mocha.before(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  mocha.after(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  describe('(no args)', function () {
    let dir, files, output;

    before((done) => {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    after((done) => {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('is expected to create a basic app', (done) => {
      run(dir, [], (err, stdout) => {
        if (err) return done(err); // not sure what it does for us?
        files = parseCreatedFiles(stdout, dir);
        output = stdout;
        expect(files.length).to.equal(7)
        done();
      });
    });

    it('is expected to have basic files', () => {
      expect(files.indexOf('bin/www')).to.not.equal(-1)
      expect(files.indexOf('app.js')).to.not.equal(-1)
      expect(files.indexOf('package.json')).to.not.equal(-1)
    });

    it('is expected to have a package.json file', function () {
      const file = path.resolve(dir, 'package.json');
      const content = fs.readFileSync(file, 'utf8');
      const expectedContent = '{\n'
        + '  "name": ' + JSON.stringify(path.basename(dir)) + ',\n'
        + '  "version": "0.0.0",\n'
        + '  "private": true,\n'
        + '  "scripts": {\n'
        + '    "start": "node ./bin/www"\n'
        + '  },\n'
        + '  "dependencies": {\n'
        + '    "body-parser": "~1.13.2",\n'
        + '    "cookie-parser": "~1.3.5",\n'
        + '    "express": "~4.13.1"\n'
        + '  }\n'
        + '}'

      expect(content).to.equal(expectedContent)
    });

    it('is expected to have installable dependencies', (done) => {
      this.timeout(30000);
      npmInstall(dir, done);
    });

    it('is expected to export an express app from app.js', function () {
      const file = path.resolve(dir, 'app.js');
      const app = require(file);
      expect(typeof (app)).to.equal('function')
      expect(typeof (app.handle)).to.equal('function')
    });

    it('should respond to HTTP request', async (done) => {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
        .get('/')
        .expect(404, 'Cannot GET /\n', done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app)
        .get('/does_not_exist')
        .expect(404,'Cannot GET /does_not_exist\n', done);
    });
  });

  describe('--git', function () {
    let dir, files;

    mocha.before( (done) =>  {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after( (done) => {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app with git files',  (done) => {
      run(dir, ['--git'], (err, stdout) => {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 8, 'should have 8 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1, 'should have bin/www file');
      assert.notEqual(files.indexOf('app.js'), -1, 'should have app.js file');
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have .gitignore', function () {
      assert.notEqual(files.indexOf('.gitignore'), -1, 'should have .gitignore file');
    });
  });

  describe('-h', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['-h'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: express/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        done();
      });
    });
  });


  describe('--help', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['--help'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: express/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        done();
      });
    });
  });
});

function cleanup(dir, callback) {
  if (typeof dir === 'function') {
    callback = dir;
    dir = tempDir;
  }

  rimraf(tempDir, function (err) {
    callback(err);
  });
}

// function createEnvironment(callback) {
//   var num = process.pid + Math.random();
//   var dir = path.join(tempDir, ('app-' + num));

//   mkdirp(dir, function ondir(err) {
//     if (err) return callback(err);
//     callback(null, dir);
//   });
// }

function npmInstall(dir, callback) {
  exec('npm install', { cwd: dir }, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  });
}

function parseCreatedFiles(output, dir) {
  var files = [];
  var lines = output.split(/[\r\n]+/);
  var match;

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1];

      if (dir) {
        file = path.resolve(dir, file);
        file = path.relative(dir, file);
      }

      file = file.replace(/\\/g, '/');
      files.push(file);
    }
  }

  return files;
}

// function run(dir, args, callback) {
//   var argv = [binPath].concat(args);
//   var exec = process.argv[0];
//   var stderr = '';
//   var stdout = '';

//   var child = spawn(exec, argv, {
//     cwd: dir
//   });

//   child.stdout.setEncoding('utf8');
//   child.stdout.on('data', function ondata(str) {
//     stdout += str;
//   });
//   child.stderr.setEncoding('utf8');
//   child.stderr.on('data', function ondata(str) {
//     process.stderr.write(str);
//     stderr += str;
//   });

//   child.on('close', onclose);
//   child.on('error', callback);

//   function onclose(code) {
//     var err = null;

//     try {
//       expect(stderr).to.deep.equal('')
//       // assert.equal(stderr, '');
//       expect(code).to.equal(0)
//       // assert.strictEqual(code, 0);
//     } catch (e) {
//       err = e;
//     }

//     callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
//   }
// }
