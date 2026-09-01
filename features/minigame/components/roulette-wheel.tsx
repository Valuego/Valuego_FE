'use client';

import type { EditableParticipant } from './participant-name-fields';

import { MINIGAME_MEMBERS } from '../minigame.constants';

const SIZE = 264;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2;

const polar = (angleFromTopDeg: number, radius: number) => {
  const rad = ((angleFromTopDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
};

const segmentPath = (startDeg: number, endDeg: number) => {
  const start = polar(startDeg, RADIUS);
  const end = polar(endDeg, RADIUS);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
};

type RouletteWheelProps = {
  participants: EditableParticipant[];
  rotation: number;
  spinning: boolean;
  spinMs: number;
};

export const RouletteWheel = ({ participants, rotation, spinning, spinMs }: RouletteWheelProps) => {
  const count = participants.length;
  const slice = count > 0 ? 360 / count : 360;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="size-[264px] overflow-visible"
      aria-hidden
    >
      <g
        style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${spinMs}ms cubic-bezier(0.12, 0.75, 0.12, 1)` : 'none',
        }}
      >
        {participants.map((participant, index) => {
          const startDeg = index * slice;
          const endDeg = (index + 1) * slice;
          const midDeg = startDeg + slice / 2;
          const label = polar(midDeg, RADIUS * 0.62);
          const color =
            MINIGAME_MEMBERS.find((member) => member.key === participant.key)?.colorHex ??
            MINIGAME_MEMBERS[index % MINIGAME_MEMBERS.length]?.colorHex ??
            '#3366ff';

          return (
            <g key={participant.id}>
              <path d={segmentPath(startDeg, endDeg)} fill={color} stroke="white" strokeWidth={2} />
              <text
                x={label.x}
                y={label.y}
                fill="white"
                fontSize={13.5}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ transformOrigin: `${label.x}px ${label.y}px` }}
              >
                {participant.name || `참가자${index + 1}`}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** 포인터(12시)에 세그먼트 mid가 오도록 필요한 추가 회전각 */
export const getSpinDelta = (currentRotation: number, winnerIndex: number, count: number) => {
  const slice = 360 / count;
  const midFromTop = winnerIndex * slice + slice / 2;
  const base = ((currentRotation % 360) + 360) % 360;
  const target = (((360 - midFromTop) % 360) + 360) % 360;
  const delta = (target - base + 360) % 360;
  return delta + 360 * 4;
};
