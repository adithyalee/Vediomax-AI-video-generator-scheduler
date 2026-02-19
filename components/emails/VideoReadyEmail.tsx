
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface VideoReadyEmailProps {
    videoUrl: string;
    videoTitle?: string;
    thumbnailUrl?: string; // Optional: we might not have a dedicated thumbnail yet, or use the first image
    userName?: string;
}

export const VideoReadyEmail = ({
    videoUrl,
    videoTitle = "Your Video",
    thumbnailUrl,
    userName,
}: VideoReadyEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your video "{videoTitle}" is ready!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Video Generated Successfully! 🎬</Heading>
                    <Text style={text}>
                        Hi {userName || "there"},
                    </Text>
                    <Text style={text}>
                        Great news! Your video <strong>{videoTitle}</strong> has finished rendering and is ready to watch.
                    </Text>

                    {thumbnailUrl && (
                        <Section style={imageSection}>
                            <Img
                                src={thumbnailUrl}
                                width="100%"
                                height="auto"
                                alt="Video Thumbnail"
                                style={image}
                            />
                        </Section>
                    )}

                    <Section style={btnContainer}>
                        <Button style={button} href={videoUrl}>
                            Watch Video
                        </Button>
                    </Section>

                    <Text style={text}>
                        Or copy this link: <Link href={videoUrl} style={link}>{videoUrl}</Link>
                    </Text>

                    <Text style={footer}>
                        Powered by VedioMax
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default VideoReadyEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const h1 = {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.1",
    marginBottom: "24px",
};

const text = {
    color: "#444",
    fontSize: "16px",
    lineHeight: "26px",
};

const imageSection = {
    margin: "24px 0",
};

const image = {
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const btnContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#5F51E8",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px",
    width: "100%",
    maxWidth: "200px",
    margin: "0 auto",
};

const link = {
    color: "#5F51E8",
    wordBreak: "break-all" as const,
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "24px",
    marginTop: "24px",
};
