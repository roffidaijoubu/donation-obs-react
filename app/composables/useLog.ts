import { z } from 'zod';

const logStateSchema = z.object({
  logs: z.array(z.string()).default([])
});

type LogState = z.infer<typeof logStateSchema>;

const state = useState<LogState>('log', () => logStateSchema.parse({}));

export const useLog = () => {
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    state.value.logs.push(logMessage);
    console.log(logMessage);
  };

  return {
    state,
    addLog
  };
};