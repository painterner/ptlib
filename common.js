const fs = require("fs")
const path = require('path')
const _ = require('lodash')
const assert = require('assert')


PATH = {
    homeUser: process.env.HOME
}


class PathParser {

    unix(ipath) {
        // print('unix path',ipath);
        var paths = ipath
        var flag = false;
        if(ipath.constructor.name !== 'Array'){
            paths = [ipath]
            flag = true
        }
        paths = paths.map(path => {
            if (path.slice(0,1) === '~' ){
                path = path.slice(1);
                path = PATH.homeUser + path
                return path
            }
            return path
        })
        
        return flag ? paths[0] : paths
    }

    windows(ipath) {
        return ipath
    }

    constructor() {
        this.pathParser = (ipath) =>  {
            var system
            if(ipath.constructor.name === 'Array' || ipath.constructor.name === 'String'){
                system = {
                    unix: ipath,
                    windows: ipath,
                    macos: ipath
                }    
            } else {
                system = {
                    unix: ipath.unix,
                    windows: ipath.windows,
                    macos: ipath.macos
                }
            }
    
            if(process.platform.match(/linux/ig) || process.platform.match(/unix/ig)){
                return this.unix(system.unix)
            } 
            if(process.platform.match(/win/ig)){
                return this.windows(system.windows)
            }
        }
    }
}
// todo: di inject ( or transfer it to global variable)
const mPathParser = new PathParser();

class CrossPath {
    constructor(obj) {
        this.unix  =    obj.unix
        this.windows =  obj.windows
        this.macos =    obj.macos
    }

}



function strip(str) {
    var match = /^[\s]*(.*)\b[\s]*/.exec(str)
    // var match = /^[\s]*(.*)[\s]*/.exec(str)
    // var match = /^[\s]*(.*)\b[\s]*$/.exec(str)  // why can't find str= `if m = 'k'`
    // \b 查找是从后向前查找？
    if (match === null) {
        return ''
    }
    else {
        return match[1]
    }
}

function split(str, spliter=/\s/) {
    const result = []
    let t=''
    for (i in str) {
        if( !str[i].match(spliter) ){
            t += str[i]
        } else {
            if ( i !== '0' && (!str[i-1].match(spliter)) ){
                result.push(t)
                t = ''
            }
        }
    }
    if(t){result.push(t)}
    return result
}

function search(str, reg) {
    // 如何检测是否是/.*/g类型呢?
	while( mattached = reg.exec(str)) {
		console.log(mattached[0], mattached[1], mattached.index)
    }
    
}

function replace( str, reg, callback) {
    str = str.replace(reg, (...args) => {
        return callback(str, ...args)
    })
    return str
}

const pathOps = (function () {

    return {
        nomalized: function (...lpath) {
            return path.join(...lpath, '/').slice(0,-1)
        }
    }

}())


class FileOps {

    fparseReg(regOptions) {
        assert(regOptions.reg, `can't find regOptions.reg`)
        var reg = regOptions.reg
        const regFlag = regOptions.flag || 'g'
        reg = RegExp(reg, regFlag)
        return reg
    }

    freplace (lpath, regOptions, callback, options = {}) {
        var reg = this.fparseReg(regOptions)
        console.log(reg)

        options.print = false
        const allfile = this.findFile(lpath, options)
        allfile.forEach( el => {
            const f = fs.readFileSync(el)
            var str = f.toString()
            str = replace(str, reg, callback)
            fs.writeFileSync(el, str)
        })
    }

    fsearch (lpath, regOptions, options) {
        var reg = this.fparseReg(regOptions)
        console.log(reg)

        options.print = false
        const allfile = this.findFile(lpath,options)
        allfile.forEach( el => {
            const f = fs.readFileSync(el)
            var str = f.toString()
            search(str, reg)
        }) 
    }

    findFile (lpath='.', options={}) {
        if(options.print === undefined)
            options.print = true
        const finded = []
        function exeute(lpath, options) {
            lpath = pathOps.nomalized(lpath)
            if(fs.lstatSync(lpath).isDirectory()){
                var fd = fs.readdirSync(lpath)
               
                fd = collecOps.addPrefix(fd, lpath, pathOps.nomalized )

                fd = arrayFilter(fd, options);
            
                // finded = _.concat(finded, fd)    
                // console.log()
            
                fd.forEach(el => {
                    // el = path.join(lpath, el)
                    exeute(el, options)
                })
            } else {
                if(fs.existsSync(lpath)){
                    const reg = options.reg || [/.*/]
                    var newMatch = false
                    reg.forEach(el => {
                        // if(! ( el1.match(el) || el1.match(el.next) || ...) ){
                        //     match = false
                        // }
                        newMatch = newMatch || lpath.match(el)
                    });
                
                    if(newMatch){
                        if(options.print)
                            console.log("matched", lpath)
                        finded.push(lpath)
                    }
                    
                }      
            }
        }
        exeute(lpath, options)
        return finded
    }


}



const fileOps = new FileOps()


function zip(collec, callback) {
    if(collec && collec.length && collec.length > 0) {
        for(var i in collec[0]) {
            const r0 = collec.map( x => x[i])
            callback(...r0)
        }
    }
}

const collecOps = {
    addPrefix: (array, prefix, parser) => {
        return array.map( x => parser(prefix, x))
    }
}

function arrayFilter(original, options){
    const include = options.include || [/.*/]  // 空字符也匹配（即匹配到0次)
    const exclude = options.exclude || []
    newfd = []
    original.forEach( el1 => {
        var match = false
        include.forEach( el2 => {
            if(el1.match(el2)){
                match = true
            }
        })
        exclude.forEach( el2 => {
            // console.log(el1)
            if(el1.match(el2)){
                match = false
            }
        })
            
        if(match){
            newfd.push(el1)
        }
    })
    
    return newfd
}


function test(){
    console.log(strip('     w3w w2c '))
    console.log(['spliter test', split('  123 fff     ggg')])
    console.log(['spliter test', split('123 fff     ggg ')])
    console.log(['spliter test', split(' 123 fff     ggg ')])

    // viewChild("hello")
    fs.copyFileSync('common.js', 'common_copy.js')
    fileOps.fsearch("common_copy.js", {reg: `viewChild\\("(.*)"\\)`, flag: "g"} )
    fileOps.freplace('common_copy.js', {reg: `viewChild\\("(.*)"\\)`, flag: "g"}, (str,...m) => {
        const match = m[0], submatch = m[1], matchPos = m[2];
        return match.slice(0, match.length-1) + ', {static: false}' + match.slice(-1)
    })
}


module.exports = {
    PATH,

    CrossPath,
    FileOps,

	strip,
    split,
    collecOps,
    fileOps,
    test,
    pathParser: mPathParser.pathParser
}

// fileOps.fsearch("/home/ka/Documents/tmp1/new-employer/employer-portal-ui",  {reg: `ViewChild\\([",'](.*)[",']\\)`, flag: "g"}, { exclude: [
//     "/home/ka/Documents/tmp1/new-employer/employer-portal-ui/.git",
//     "/home/ka/Documents/tmp1/new-employer/employer-portal-ui/node_modules",
// ]})

// fileOps.freplace("/home/ka/Documents/tmp1/new-employer/employer-portal-ui",  {reg: `ViewChild\\([",'](.*)[",']\\)`, flag: "g"}, (str, ...m) => {
//     const match = m[0], submatch = m[1], matchPos = m[2];
//     return match.slice(0, match.length-1) + ', {static: false}' + match.slice(-1)
// }, { exclude: [
//     "/home/ka/Documents/tmp1/new-employer/employer-portal-ui/.git",
//     "/home/ka/Documents/tmp1/new-employer/employer-portal-ui/node_modules",
// ]})

// Array(
//     "/home/ka/Documents/tmp1/new-employer/employer-portal-ui",
//     "/home/ka/Documents/tmp1/compare/employer-portal-ui"

// ).forEach(basepath => {
//     console.log(["basepath----",basepath])
//     fileOps.findFile(basepath, {
//         exclude: [
//             ".*/node_modules/.*"
//         ],
//         reg: [".*\\.png", /Navbar\.Component\.html/ig]   
//     })
// })



/*
notes: RegExp(".*\\.png") 写两次'\'的原因是，第一次处理是通用字符处理，这是语言决定的，会存储为".*\.png"， 然后RegExp才负责处理。
*/