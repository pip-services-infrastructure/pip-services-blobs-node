let BlobsProcess = require('../obj/src/container/BlobsProcess').BlobsProcess;

try {
    new BlobsProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
