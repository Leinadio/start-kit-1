#!/usr/bin/env node
import { Command } from "commander"

const program = new Command()
program.name("my-starter").description("Starter kit module manager")
program.parse()
