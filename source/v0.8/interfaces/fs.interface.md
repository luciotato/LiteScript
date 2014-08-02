    
    public namespace fs
        
        method exists(path, callback) 
        method existsSync(path) 
        method readFile(path, options, callback_) 
        method readFileSync(path, options) 
        method close(fd, callback) 
        method closeSync(fd) 
        method open(path, flags, mode, callback) 
        method openSync(path, flags, mode) 
        method read(fd, buffer, offset, length, position, callback) 
        method readSync(fd, buffer, offset, length, position) 
        method write(fd, buffer, offset, length, position, callback) 
        method writeSync(fd, buffer, offset, length, position) 
        method rename(oldPath, newPath, callback) 
        method renameSync(oldPath, newPath) 
        method truncate(path, len, callback) 
        method truncateSync(path, len) 
        method ftruncate(fd, len, callback) 
        method ftruncateSync(fd, len) 
        method rmdir(path, callback) 
        method rmdirSync(path) 
        method fdatasync(fd, callback) 
        method fdatasyncSync(fd) 
        method fsync(fd, callback) 
        method fsyncSync(fd) 
        method mkdir(path, mode, callback) 
        method mkdirSync(path, mode) 
        method readdir(path, callback) 
        method readdirSync(path) 
        method fstat(fd, callback) 
        method lstat(path, callback) 
        method stat(path, callback) 
        method fstatSync(fd) 
        method lstatSync(path) 
        method statSync(path) 
        method readlink(path, callback) 
        method readlinkSync(path) 
        method symlink(destination, path, type_, callback) 
        method symlinkSync(destination, path, type) 
        method link(srcpath, dstpath, callback) 
        method linkSync(srcpath, dstpath) 
        method unlink(path, callback) 
        method unlinkSync(path) 
        method fchmod(fd, mode, callback) 
        method fchmodSync(fd, mode) 
        method chmod(path, mode, callback) 
        method chmodSync(path, mode) 
        method fchown(fd, uid, gid, callback) 
        method fchownSync(fd, uid, gid) 
        method chown(path, uid, gid, callback) 
        method chownSync(path, uid, gid) 
        method utimes(path, atime, mtime, callback) 
        method utimesSync(path, atime, mtime) 
        method futimes(fd, atime, mtime, callback) 
        method futimesSync(fd, atime, mtime) 
        method writeFile(path, data, options, callback) 
        method writeFileSync(path, data, options) 
        method appendFile(path, data, options, callback_) 
        method appendFileSync(path, data, options) 
        method watch(filename) 
        method watchFile(filename) 
        method unwatchFile(filename, listener) 
        method realpathSync(p, cache) 
        method realpath(p, cache, cb) 
        method createReadStream(path, options) 
        method createWriteStream(path, options) 
    
    
        public class Stats
            constructor new Stats () 
            
            method isDirectory() 
            method isFile() 
            method isBlockDevice() 
            method isCharacterDevice() 
            method isSymbolicLink() 
            method isFIFO() 
            method isSocket() 
        
        
        public class ReadStream
            constructor new ReadStream (path, options) 
            
            method open() 
            method destroy() 
            method close(cb) 
        
        
        public class FileReadStream
            constructor new FileReadStream (path, options) 
            
            method open() 
            method destroy() 
            method close(cb) 
        
        
        public class WriteStream
            constructor new WriteStream (path, options) 
            
            method open() 
            method destroy() 
            method close(cb) 
            method destroySoon(chunk, encoding, cb) 
        
        
        public class FileWriteStream
            constructor new FileWriteStream (path, options) 
            
            method open() 
            method destroy() 
            method close(cb) 
            method destroySoon(chunk, encoding, cb) 
        
        
        public class SyncWriteStream
            constructor new SyncWriteStream (fd) 
            
            method write(data, arg1, arg2) 
            method end(data, arg1, arg2) 
            method destroy() 
            method destroySoon() 

