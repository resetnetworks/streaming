import { CreateJobCommand } from "@aws-sdk/client-mediaconvert";
import mediaConvertClient from "./mediaConvertClient.js";

export const convertAudio = async (inputUrl, outputPrefix) => {
  const outputBase = `s3://${process.env.AWS_S3_BUCKET}/${outputPrefix}/`;

  const command = new CreateJobCommand({
    Role: process.env.MEDIACONVERT_ROLE,
    Settings: {
      OutputGroups: [
        {
          Name: "File Group",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: outputBase,
            },
          },
          Outputs: [
            {
              ContainerSettings: {
                Container: "MP4",
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 64000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              NameModifier: "_64kbps",
              Extension: "m4a",
            },
            {
              ContainerSettings: {
                Container: "MP4",
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 128000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              NameModifier: "_128kbps",
              Extension: "m4a",
            },
            {
              ContainerSettings: {
                Container: "MP4",
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 256000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              NameModifier: "_256kbps",
              Extension: "m4a",
            },
          ],
        },
      ],
      Inputs: [
        {
          FileInput: inputUrl,
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
        },
      ],
    },
  });

  const result = await mediaConvertClient.send(command);
  return result;
};
