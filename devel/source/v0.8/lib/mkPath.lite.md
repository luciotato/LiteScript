Module mkPath
=============

    import fs, path

### export function toFile(filename, mode)
Create a path to a file

        create path.dirname(filename), mode


### export function create (dirPath, mode)
Make sure a path exists - Recursive
        
        if dirExists(dirPath), return; //ok! dir exists

else... recursive:
try a folder up, until a dir is found (or an error thrown)

        create path.dirname(dirPath), mode

ok, found parent dir! - make the children dir

        fs.mkdirSync dirPath, mode

return into recursion, creating children subdirs in reverse order (of recursion)

        return


### helper function dirExists(dirPath)
    
        if fs.statSync(dirPath).isDirectory()
            return true //ok! exists and is a directory
        else 
            throw new Error('#{dirPath} exists but IT IS NOT a directory')
    
        exception err

            //if dir does not exists, return false
            if err.code is 'ENOENT', return false
            throw err //another error

