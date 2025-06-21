import { type Container, type Engine } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import { loadFull } from "tsparticles";

const ParticlesLoader = memo(() => {
    const [init, setInit] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initRef = useRef(false);

    useEffect(() => {
        // Eğer zaten initialize edildiyse tekrar etme
        if (initRef.current) return;
        
        let isMounted = true;
        
        const initEngine = async () => {
            try {
                console.log("Initializing particles engine...");
                await initParticlesEngine(async (engine: Engine) => {
                    await loadFull(engine);
                });
                
                if (isMounted) {
                    console.log("Particles engine initialized successfully");
                    setInit(true);
                    initRef.current = true;
                }
            } catch (error) {
                console.error("Failed to initialize particles engine:", error);
                if (isMounted) {
                    setError("Particles engine yüklenemedi");
                    setInit(true);
                    initRef.current = true;
                }
            }
        };

        initEngine();

        return () => {
            isMounted = false;
        };
    }, []);

    const particlesLoaded = useCallback(async (container?: Container) => {
        if (container) {
            console.log("Particles loaded successfully");
            setIsLoading(false);
        }
    }, []);

    const particlesInit = useCallback(async (engine: Engine) => {
        console.log("Particles init callback");
        await loadFull(engine);
    }, []);

    // Particles konfigürasyonunu memoize et
    const particlesConfig = useMemo(() => ({
        fullScreen: {
            enable: true,
            zIndex: -1,
        },
        background: {
            color: {
                value: "transparent",
            },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: "push",
                },
                onHover: {
                    enable: true,
                    mode: "grab",
                },
                resize: {
                    enable: true,
                },
            },
            modes: {
                push: {
                    quantity: 4,
                },
                grab: {
                    distance: 150,
                    links: {
                        opacity: 0.6,
                        color: "#4dc9fa",
                    },
                },
            },
        },
        particles: {
            color: {
                value: [
                    "#4dc9fa", // Uzay mavisi
                    "#8a2be2", // Galaktik mor
                    "#00ffff", // Cyan (nebula)
                    "#ff6b9d", // Nebula pembe
                    "#ffd700", // Altın yıldız
                    "#00ff88", // Uzay yeşili
                    "#ff8c00", // Turuncu güneş
                    "#9370db", // Lavanta galaksi
                    "#20b2aa", // Deniz yeşili
                    "#ff1493", // Derin pembe
                ],
            },
            links: {
                color: "#4dc9fa",
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1.5,
            },
            collisions: {
                enable: true,
            },
            move: {
                direction: "none" as const,
                enable: true,
                outModes: {
                    default: "bounce" as const,
                },
                random: false,
                speed: 1.2,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 60,
            },
            opacity: {
                value: 0.6,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 2, max: 4 },
            },
        },
        detectRetina: true,
    }), []);

    if (error) {
        return (
            <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#141628]">
                <div className="text-center text-[#e5eaff]">
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="text-sm opacity-70">{error}</div>
                </div>
            </div>
        );
    }

    if (!init) {
        return (
            <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#141628]">
                <div className="text-center text-[#e5eaff]">
                    <div className="animate-spin text-2xl mb-2">🌌</div>
                    <div className="text-sm opacity-70">Particles yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={particlesConfig}
            className="fixed inset-0 z-0"
        />
    );
});

ParticlesLoader.displayName = "ParticlesLoader";

export default ParticlesLoader; 