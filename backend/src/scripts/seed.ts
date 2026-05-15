import { ExecArgs } from "@medusajs/framework/types"

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve("logger")

  logger.info(
    "No seed data is configured. Use Medusa Admin or add v2 seed logic here."
  )
}
