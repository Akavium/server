import { Router } from "express";
import { Tspec, TspecDocsMiddleware } from "tspec";

const config = {
	specPathGlobs: [
		"src/app/v1/users/spec.ts",
		"src/app/v1/posts/spec.ts",
	],
	tsconfigPath: "tsconfig.json",
	outputPath: "docs",
	specVersion: 3,
	openapi: {
		title: "Akavium API",
		version: "1.0.0",
		description: "Akavium API 문서",
	},
	debug: true,
	ignoreErrors: false
}
const docsRouter = Router();
docsRouter.use(
	"/docs",
	await TspecDocsMiddleware(config as Tspec.GenerateParams)
);
export default docsRouter;