fs = Npm.require 'fs-extra'
path = Npm.require 'path'
assert = Npm.require 'assert'
spawn = Npm.require('child_process').spawn

@sanjo ?= {}

class sanjo.LongRunningChildProcess

  taskName: null
  child: null
  # Cache the pid, so we don't read the file each time.
  # This object should be the only one who writes to the pid file.
  pid: null
  dead: false

  constructor: (taskName) ->
    log.debug "LongRunningChildProcess.constructor(taskName=#{taskName})"

    @taskName = taskName
    @pid = @readPid()


  getTaskName: ->
    @taskName


  getChild: ->
    @child


  getPid: ->
    @pid


  _setPid: (pid) ->
    log.debug "LongRunningChildProcess._setPid(pid=#{pid})"
    @pid = pid
    log.debug "Saving #{@taskName} pid #{pid} to #{@_getPidFilePath()}"
    fs.outputFile(@_getPidFilePath(), "#{pid}")


  isDead: ->
    @dead


  isRunning: ->
    log.debug 'LongRunningChildProcess.isRunning()'

    pid = @getPid()

    if not pid
      log.debug "LongRunningChildProcess.isRunning returns false"
      return false

    try
    # Check for the existence of the process without killing it, by sending signal 0.
      process.kill(pid, 0)
      # process is alive, otherwise an exception would have been thrown, so we need to exit.
      log.debug "LongRunningChildProcess.isRunning returns true"
      return true
    catch err
      log.trace err
      log.debug "LongRunningChildProcess.isRunning returns false"
      return false


  # Returns the pid of the main Meteor app process
  _getMeteorPid: ->
    parentPid = null
    # For Meteor < 1.0.3
    parentPidIndex = _.indexOf(process.argv, '--parent-pid')
    if parentPidIndex != -1
      parentPid = process.argv[parentPidIndex + 1]
      log.debug("The pid of the main Meteor app process is #{parentPid}")
    # For Meteor >= 1.0.3
    else if process.env.METEOR_PARENT_PID
      parentPid = process.env.METEOR_PARENT_PID
      log.debug("The pid of the main Meteor app process is #{parentPid}")
    else
      log.error('Could not find the pid of the main Meteor app process')

    return parentPid


  _getMeteorAppPath: ->
    @appPath = path.resolve(findAppDir()) if not @appPath
    return @appPath


  _getMeteorLocalPath: ->
    path.join(@_getMeteorAppPath(), '.meteor/local')


  _getPidFilePath: ->
    path.join(@_getMeteorLocalPath(), "run/#{@taskName}.pid")


  _getLogFilePath: ->
    path.join(@_getMeteorLocalPath(), "log/#{@taskName}.log")


  _getSpawnScriptPath: ->
    path.join(@_getMeteorLocalPath(),
      'build/programs/server/assets/packages/sanjo_karma/lib/spawnScript.js'
    )


  readPid: ->
    log.debug('LongRunningChildProcess.readPid()')
    try
      pid = parseInt(fs.readFileSync(@_getPidFilePath(), {encoding: 'utf8'}, 10))
      log.debug("LongRunningChildProcess.readPid returns #{pid}")
      return pid
    catch err
      log.debug('LongRunningChildProcess.readPid returns null')
      return null


  spawn: (options) ->
    log.debug "LongRunningChildProcess.spawn()", options
    check options, Match.ObjectIncluding({
        killSignals: Match.Optional([String])
        logToConsole: Match.Optional(Boolean)
        command: String
        args: [String]
        options: Match.Optional(Match.ObjectIncluding({
          cwd: Match.Optional(String)
          env: Match.Optional(Object)
        }))
      }
    )

    if @isRunning()
      return false

    logFile = @_getLogFilePath()
    fs.ensureDirSync(path.dirname(logFile))
    @fout = fs.openSync(logFile, 'w')
    #@ferr = fs.openSync(logFile, 'w')

    nodePath = process.execPath
    nodeDir = path.dirname(nodePath)
    # Expose the Meteor node binary path for the script that is run
    env = process.env
    env.PATH = nodeDir + ':' + process.env.PATH

    spawnOptions = {
      cwd: @_getMeteorAppPath(),
      env: env,
      detached: true,
      stdio: ['ignore', @fout, @fout]
    }
    command = path.basename options.command
    spawnScript = @_getSpawnScriptPath()
    commandArgs = [spawnScript, @_getMeteorPid(), options.command].concat(options.args)
    fs.chmodSync(spawnScript, 0o544)

    log.debug("LongRunningChildProcess.spawn is spawning '#{command}'")

    @child = spawn(nodePath, commandArgs, spawnOptions)
    @dead = false
    @_setPid(@child.pid)

    @child.on "exit", (code) =>
      log.debug "LongRunningChildProcess: child_process.on 'exit': command=#{command} code=#{code}"
      fs.closeSync(@fout)

    return true


  kill: (signal = "SIGINT") ->
    log.debug "LongRunningChildProcess.kill(signal=#{signal})"

    unless @dead
      try
      # Providing a negative pid will kill the entire process group,
      # i.e. the process and all it's children
      # See man kill for more info
      #process.kill(-@child.pid, signal)
        if @child?
          @child.kill(signal)
        else
          pid = @getPid()
          process.kill(pid, signal)
        @dead = true
        @pid = null
        fs.removeSync(@_getPidFilePath())
      catch err
        log.warn "Error: While killing process:\n", err
