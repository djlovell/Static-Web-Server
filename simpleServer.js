"use strict";

const http   = require( 'http'          );
const fs     = require( 'fs'            );
const url    = require( 'url'           );
const path   = require( 'path'          );

const PORT = 1095;


var server = http.createServer( handleRequest );

/** @function serveIndex
 * Serves a listing of directory contents 
 * @param {string} filePath - specifies the directory path to read 
 * @param {http.ServerResponse} res - the http response object
 */
function serveIndex( filePath, res )
    {
    fs.readdir( filePath, function( err, files )
        {
        if( err )
            {
            res.statuscode = 500;
            console.error( err );
            res.end( "Server Error" );
            }
        var html = "<p>Index of " + filePath + "</p>";
        html += "<ul>";
        html += files.map( function( item )
            {
            var pathStr = String( filePath );
            if( pathStr.slice(-1) !== '\\' ) 
                {
                filePath = path.join( pathStr, '\\');    
                }
            return "<li><a href='" + "\\" +
                    filePath.slice( 7, String( filePath ).length ) + 
                    item + "'>" + item + "</a></li>";
            }).join( "" );
        html += "</ul>";
        res.end( html );   
        });
    }

/** @function serveFile
 * Serves the specified file with the provided response object
 * @param {string} path - specifies the file path to read 
 * @param {http.serverResponse} res - the http response object
 */
function serveFile( path, res )
    {
    fs.readFile( path, function( err, data )
        {
        if( err && err.code === 'ENOENT' )
            {
            res.statuscode = 404;
            res.end( "Server Error: File not found." );
            }
        else if( err )
            {
            res.statuscode = 500;
            res.end( "Server Error: Unknown cause." );
            } 
        res.end( data );
        });
    }

/** @function handleRequest 
 * Request handler for our http server 
 * @param {http.ClientRequest} req - the http request object
 * @param {http.ServerResponse} res - the http response object
 */
function handleRequest( req, res )
    {
    var fullPath = 'public' + req.url;
    fs.lstat( fullPath, function( err, stats)
        {
        if( err )
            {
            res.end( "Error: Cannot view file. ");
            return;
            }
        if( stats.isDirectory() )
            {
            serveIndexFile( fullPath, req.url, res );
            return;
            }
        if( stats.isFile() )
            {
            console.log( "About to serve file: " + fullPath );
            serveFile( fullPath, res )
            return;
            }
		res.end( "Error: Is not a valid file or directory. ");
        return;
        });
    }

/** @function serveIndexFile
 * Attempts to serve a directory's file listings or index.html file
 * @param {string} filePath - specifies the file path to read 
 * @param {string} reqURL - specifies the orignal request url 
 * @param {http.ServerResponse} res - the http response object
 */
function serveIndexFile( filePath, reqURL, res )
    {
    var indexPath = path.join( filePath, '/index.html' );
    fs.lstat( indexPath, function( err, stats)
        {
        if( err )
            {
            serveIndex( filePath, res );
            return;
            }
        if( stats.isFile() )
            {
            console.log( "About to serve file 2: " + indexPath );
            serveFile( indexPath, res );
            return;
            }
        });
    }

server.listen( PORT, function()
    {
    console.log( "Listening on port " + PORT );
    });








