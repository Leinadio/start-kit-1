#!/usr/bin/env node
import { Command } from "commander"
import { join } from "node:path"
import { addModule } from "./commands/add"

const program = new Command()
program.name("my-starter").description("Starter kit module manager")

program
  .command("add <module>")
  .description("Ajoute un module")
  .action((module: string) => {
    const projectDir = process.cwd()
    const modulesRoot = join(__dirname, "..", "..", "..", "modules")
    addModule(module, projectDir, modulesRoot)
    console.log(`Module ${module} ajouté.`)
  })

program.parse()
