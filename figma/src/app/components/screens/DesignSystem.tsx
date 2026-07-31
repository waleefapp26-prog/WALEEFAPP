import { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Card } from "../Card";
import { Badge } from "../Badge";
import { ProgressBar } from "../ProgressBar";
import { MatchPercentage } from "../MatchPercentage";
import { Tag } from "../Tag";
import { Toggle } from "../Toggle";

export function DesignSystem() {
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-6xl mb-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] bg-clip-text text-transparent">
            Waleef Design System
          </h1>
          <p className="text-xl text-[#6B6B6B]">
            Complete UI Kit - Production Ready Components
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="h-24 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded-[12px] mb-3" />
              <p className="font-medium">Primary Gradient</p>
              <p className="text-sm text-[#6B6B6B]">#FF6B9D → #FF8A5C</p>
            </Card>
            <Card>
              <div className="h-24 bg-[#F5F1E8] rounded-[12px] mb-3" />
              <p className="font-medium">Beige</p>
              <p className="text-sm text-[#6B6B6B]">#F5F1E8</p>
            </Card>
            <Card>
              <div className="h-24 bg-[#FFF8F0] rounded-[12px] mb-3" />
              <p className="font-medium">Cream</p>
              <p className="text-sm text-[#6B6B6B]">#FFF8F0</p>
            </Card>
            <Card>
              <div className="h-24 bg-gradient-to-r from-[#D4AF37] to-[#E8C870] rounded-[12px] mb-3" />
              <p className="font-medium">Gold Accent</p>
              <p className="text-sm text-[#6B6B6B]">#D4AF37 → #E8C870</p>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Typography</h2>
          <Card>
            <h1 className="mb-2">Heading 1 - Cormorant Garamond</h1>
            <h2 className="mb-2">Heading 2 - Cormorant Garamond</h2>
            <h3 className="mb-2">Heading 3 - Cormorant Garamond</h3>
            <p className="mb-2">Body Text - Outfit Regular</p>
            <p className="text-sm text-[#6B6B6B]">
              Secondary Text - Outfit Regular
            </p>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Buttons</h2>
          <Card>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="disabled" disabled>
                Disabled Button
              </Button>
            </div>
          </Card>
        </section>

        {/* Inputs */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Default Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={setInputValue}
            />
            <Input
              label="Input with Error"
              placeholder="Enter text..."
              error="This field is required"
            />
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="default">
              <h4 className="mb-2">Default Card</h4>
              <p className="text-sm text-[#6B6B6B]">
                Standard card with subtle shadow
              </p>
            </Card>
            <Card variant="profile">
              <h4 className="mb-2">Profile Card</h4>
              <p className="text-sm text-[#6B6B6B]">
                Used for user profiles
              </p>
            </Card>
            <Card variant="info">
              <h4 className="mb-2">Info Card</h4>
              <p className="text-sm text-[#6B6B6B]">
                Gradient background variant
              </p>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Badges</h2>
          <Card>
            <div className="flex gap-4">
              <Badge variant="verified" />
              <Badge variant="premium" />
            </div>
          </Card>
        </section>

        {/* Progress Bar */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Progress Bar</h2>
          <Card>
            <ProgressBar currentStep={2} totalSteps={4} />
          </Card>
        </section>

        {/* Match Percentage */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Match Percentage Circle</h2>
          <Card>
            <div className="flex justify-around items-center">
              <MatchPercentage percentage={85} size="sm" />
              <MatchPercentage percentage={92} size="md" />
              <MatchPercentage percentage={78} size="lg" />
            </div>
          </Card>
        </section>

        {/* Tags */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Tags / Filters</h2>
          <Card>
            <div className="flex flex-wrap gap-3">
              {["Reading", "Sports", "Travel", "Cooking", "Art"].map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                />
              ))}
            </div>
          </Card>
        </section>

        {/* Toggle */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Toggle Switch</h2>
          <Card>
            <Toggle
              checked={toggleValue}
              onChange={setToggleValue}
              label="Enable notifications"
            />
          </Card>
        </section>

        {/* Spacing System */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Spacing System</h2>
          <Card>
            <p className="text-sm text-[#6B6B6B] mb-4">8px Grid System</p>
            <div className="space-y-2">
              <div className="h-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded w-16" />
              <div className="h-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded w-24" />
              <div className="h-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded w-32" />
              <div className="h-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded w-48" />
            </div>
          </Card>
        </section>

        {/* Border Radius */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6">Border Radius</h2>
          <Card>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="h-20 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded-[12px] mb-2" />
                <p className="text-sm text-center">12px</p>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded-[16px] mb-2" />
                <p className="text-sm text-center">16px</p>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded-[20px] mb-2" />
                <p className="text-sm text-center">20px</p>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded-[24px] mb-2" />
                <p className="text-sm text-center">24px</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
