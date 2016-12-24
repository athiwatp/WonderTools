## Commands

| Command | Description |
| --- | --- |
| !addcmd [name] [response] [flags]? | Add a custom command to the database. |
| !delcmd [name] | Remove a custom command from the database. |
| !permit [target] | Permit the target to post links. |
|| **Note that "points" is replaced with your custom points name** |
| !addpoints [name] [amount] | Add amount of points to target. |
| !removepoints [target] [amount] | Remove amount of points from target. |
| !checkpoints [target] | Check how many points target has. |
| !points | Get how many points the user has. |
| !givepoints [target] [amount] | Give amount of points to target. |

## Variables

| Variable | Description |
| --- | --- |
| $user | The user who called the command. |
| $followdate | The date the user started following the channel. |
| $target | The first argument sent to a custom command. |
| $1-N | The first through N arguments sent to a custom command. |
| $counter(counterName) | The number of times counterName has been accessed. counterName is optional and defaults to command name. |
| $pointsName | The name of the points. |
| $points | The number of points the user who called the command has. |
| $rand(min, max) | A random number between min and max. |
| $queue(action, name, viewer) | **action=add** Add the viewer to the queue. Name and viewer are optional, and default to command name and user who called command. |
||| **action=pop** Pull the top viewer from the queue and return their name. Queue name is optional. |
||| **action=remove** Remove viewer from the queue. Name and viewer are optional, and default to command name and user who called the command. |