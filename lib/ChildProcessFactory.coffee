fs = Npm.require 'fs'
path = Npm.require 'path'
spawn = Npm.require('child_process').spawn
assert = Npm.require('assert')

class LongRunningChildProcess

  taskName: null

  exiting: false

  child: null

  command: null

  dead: false

  appPath: null

  pidDirPath: null

  logDirPath: null

  @_spawn = Npm.require('child_process').spawn

  constructor: (taskName) ->
    log.debug "LongRunningChildProcess.constructor()"

    @taskName = taskName

    @getMeteorAppPath()
    @meteorLocalDirPath = path.resolve(@appPath, '.meteor/local')
    assert(fs.existsSync(@meteorLocalDirPath), 'Cannot find the .meteor/local directory under the app root')

    pidDirPath = path.resolve(@meteorLocalDirPath, 'run')
    fs.mkdirSync(pidDirPath) if not fs.existsSync(pidDirPath)
    @pidDirPath = pidDirPath

    logDirPath = path.resolve(@meteorLocalDirPath, 'log')
    fs.mkdirSync(logDirPath) if not fs.existsSync(logDirPath)
    @logDirPath = logDirPath
    log.debug "@logDirPath=#{@logDirPath}"

    process.on 'SIGHUP', =>
      log.debug "LongRunningChildProcess: process.on 'SIGHUP'"
      @exiting = true
      log.info "meteor is exiting, killing #{@taskName}"
      @kill('SIGHUP')


  getMeteorAppPath: ->
    log.debug 'LongRunningChildProcess.getMeteorAppPath()', @appPath
    return @appPath if @appPath is not null
    @appPath = path.resolve(findAppDir())
    log.debug "appPath='#{@appPath}'"
    return @appPath


  isRunning: ->
    log.debug 'LongRunningChildProcess.isRunning()'

    @pidFile = "#{@pidDirPath}/#{@taskName}.pid"

    log.debug "@pidFile=#{@pidFile}"

    return false if not fs.existsSync(@pidFile)

    pid = +fs.readFileSync(@pidFile)
    log.debug "Found pid file #{@pidFile} with pid #{pid}, checking if #{@taskName} is running."
    try
    # Check for the existence of the process without killing it, by sending signal 0.
      process.kill(pid, 0)
      # process is alive, otherwise an exception would have been thrown, so we need to exit.
      log.debug "Process with pid #{pid} is already running, will not launch #{@taskName} again."
      @pid = pid
      return true
    catch err
      log.trace err
      log.warn "pid file #{@pidFile} exists, but process is dead, will launch #{@taskName} again."
      return false


  spawn: (options) ->
    log.debug "LongRunningChildProcess.spawn()", arguments
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

    @command = path.basename options.command

    if @isRunning(@taskName)
      return false

    spawnOptions = @getSpawnOptions(@taskName)

    log.debug("spawning #{@command}")

    @child = LongRunningChildProcess._spawn(options.command, options.args, spawnOptions)

    log.debug "Saving #{@taskName} pid #{@child.pid} to #{@pidFile}"
    fs.writeFileSync(@pidFile, "#{@child.pid}")

    @child.on "exit", (code, signal)=>
      log.debug "LongRunningChildProcess: child_process.on 'exit': @command=#{@command} @dead=#{@dead} code=#{code} signal=#{signal}"
      @dead = true

    return true


  getSpawnOptions: (taskName)->
    log.debug 'LongRunningChildProcess.getSpawnOptions()'
    check(taskName, String)

    assert(fs.existsSync(@logDirPath), ".meteor/local/log directory doesn't exist")

    @logFile = "#{@logDirPath}/#{taskName}.log"

    @fout = fs.openSync(@logFile, 'w')
    #@ferr = fs.openSync(@logFile, 'w')

    options =
      cwd: @appPath,
      env: process.env,
      detached: true,
      stdio: [ 'ignore', @fout, @fout ]


  kill: (signal = "SIGHUP")->
    log.debug "LongRunningChildProcess.kill() signal=#{signal} @command=#{@command} @dead=#{@dead}"
    return if @dead
    try
    # Providing a negative pid will kill the entire process group,
    # i.e. the process and all it's children
    # See man kill for more info
    #process.kill(-@child.pid, signal)
      if @child?
        @child.kill(signal)
      else if @pid?
        process.kill(@pid, signal)
      @dead = true
    catch err
      log.warn "Error: While killing #{@command} with pid #{@child.pid}:\n", err
