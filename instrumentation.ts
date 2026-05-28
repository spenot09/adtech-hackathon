export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    if (!process.env.OVERMIND_API_KEY) {
      console.warn("[overmind] OVERMIND_API_KEY not set — tracing disabled");
      return;
    }
    const { default: OpenAI } = await import("openai");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { OvermindClient } = await import("@overmind-lab/trace-sdk" as any);
    const client = new OvermindClient({ apiKey: process.env.OVERMIND_API_KEY, appName: "agentbid-studio" });
    client.initTracing({ enableBatching: true, enabledProviders: { openai: OpenAI } });
    console.log("[overmind] tracing initialized (appName=agentbid-studio)");
  } catch (err) {
    console.error(`[overmind] init failed: ${err}`);
  }
}
