// Common
import ActiveCommand from '../../common/commands/ActiveCommand.js';
import AddCmdCommand from '../../common/commands/AddCmdCommand.js';
import DelCmdCommand from '../../common/commands/DelCmdCommand.js';
import FollowAgeCommand from '../../common/commands/FollowAgeCommand.js';

// Mod
import PermitCommand from '../../mod/commands/PermitCommand.js';

// Points
import AddPointsCommand from '../../points/commands/AddPointsCommand.js';
import CheckPointsCommand from '../../points/commands/CheckPointsCommand.js';
import GivePointsCommand from '../../points/commands/GivePointsCommand.js';
import PointsCommand from '../../points/commands/PointsCommand.js';
import RemovePointsCommand from '../../points/commands/RemovePointsCommand.js';

// Quote
import AddQuoteCommand from '../../quote/commands/AddQuoteCommand.js';
import DelQuoteCommand from '../../quote/commands/DelQuoteCommand.js';
import QuoteCommand from '../../quote/commands/QuoteCommand.js';

// Extras
import DNDCharacterCommand from '../../extra/commands/DNDCharacterCommand.js';
import InsultCommand from '../../extra/commands/InsultCommand.js';
import SlotsCommand from '../../extra/commands/SlotsCommand.js';

// Exports
export default [
  /* Common */  ActiveCommand, AddCmdCommand, DelCmdCommand, FollowAgeCommand,
  /* Mod    */  PermitCommand,
  /* Points */  AddPointsCommand, CheckPointsCommand, GivePointsCommand, PointsCommand, RemovePointsCommand,
  /* Quote  */  AddQuoteCommand, DelQuoteCommand, QuoteCommand,
  /* Extras */  DNDCharacterCommand, InsultCommand, SlotsCommand
];