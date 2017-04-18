'use strict';

const Generator = require('yeoman-generator');
const _chalk = require('chalk');

const _consts = require('../../utils/constants');

module.exports = class extends Generator {
    /**
     * Initializes the generator.
     */
    constructor(args, opts) {
        super(args, opts);
    }

    /**
     * Display completed message with future actions.
     */
    finish() {
        const yo = _chalk.green('yo');
        const roleSubGen = _chalk.yellow(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_ROLE}`);
        const tableSubGen = _chalk.yellow(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_TABLE}`);
        const handlerSubGen = _chalk.yellow(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_LAMBDA}`);

        const cfGenLink = _chalk.blue('https://github.com/vamship/wysknd-aws-cf-generator');
        const grunt = _chalk.green('grunt');
        const gruntCfCommand = _chalk.yellow('cf:create');
        const gruntDeployCommand = _chalk.yellow('deploy');
        const gruntHelpCommand = _chalk.yellow('help');

        this.log(_consts.SEPARATOR);
        [
            `                                                                                `,
            `--------------------------------------------------------------------------------`,
            ` This project uses cloud formation templates to create AWS resources required by`,
            ` the lambda function. Templates currently supported via yeoman are:             `,
            `   Lambda functions : ${yo} ${handlerSubGen}                                    `,
            `   DynamoDB tables  : ${yo} ${tableSubGen}                                      `,
            `   IAM Roles        : ${yo} ${roleSubGen}                                       `,
            `                                                                                `,
            ` See ${cfGenLink} for more on the cloud                             `,
            ` formation template generation library that is used for template generation     `,
            `                                                                                `,
            ` Note that lambda functions can be created and deployed via the grunt file by   `,
            ` by running:                                                                    `,
            `   ${grunt} ${gruntCfCommand}                                                   `,
            `   ${grunt} ${gruntDeployCommand}                                               `,
            `                                                                                `,
            ` Several other useful tasks have been packaged up with the Gruntfile. You can   `,
            ` review them all by running:                                                    `,
            `   ${grunt} ${gruntHelpCommand}                                                 `,
            `                                                                                `,
            `--------------------------------------------------------------------------------`,
            `                                                                                `
        ].forEach((line) => {
            this.log(line);
        });
    }
};
