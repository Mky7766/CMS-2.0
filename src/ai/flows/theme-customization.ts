'use server';

/**
 * @fileOverview Theme customization flow using LLM to determine whether to inject customized theme information or default theme information.
 *
 * - customizeTheme - A function that handles the theme customization process.
 * - CustomizeThemeInput - The input type for the customizeTheme function.
 * - CustomizeThemeOutput - The return type for the customizeTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CustomizeThemeInputSchema = z.object({
  customThemeCss: z
    .string()
    .optional()
    .describe('Custom CSS for the theme, if provided.'),
  defaultThemeCss: z
    .string()
    .describe('Default CSS for the theme.'),
});

export type CustomizeThemeInput = z.infer<typeof CustomizeThemeInputSchema>;

const CustomizeThemeOutputSchema = z.object({
  themeCss: z.string().describe('The final CSS for the theme, either customized or default.'),
});

export type CustomizeThemeOutput = z.infer<typeof CustomizeThemeOutputSchema>;

export async function customizeTheme(input: CustomizeThemeInput): Promise<CustomizeThemeOutput> {
  return customizeThemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeThemePrompt',
  input: {schema: CustomizeThemeInputSchema},
  output: {schema: CustomizeThemeOutputSchema},
  prompt: `You are a theme customization expert. You will determine whether to use the custom CSS provided by the user or the default CSS.

  If the customThemeCss is provided, use it. Otherwise, use the defaultThemeCss.

  Here is the custom CSS (if any):
  {{customThemeCss}}

  Here is the default CSS:
  {{defaultThemeCss}}

  Return the final CSS to use in the themeCss field.
  `,
});

const customizeThemeFlow = ai.defineFlow(
  {
    name: 'customizeThemeFlow',
    inputSchema: CustomizeThemeInputSchema,
    outputSchema: CustomizeThemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
